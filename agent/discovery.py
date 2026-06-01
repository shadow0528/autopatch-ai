import asyncio
import ipaddress
import socket
import logging
import requests

logger = logging.getLogger("AutoPatchAgent.Discovery")

# Default scan ports for Windows discovery
SCAN_PORTS = [3389, 445]
CONCURRENCY_LIMIT = 50

async def check_port(ip: str, port: int, timeout: float = 1.5) -> bool:
    """Attempts an async socket connection to a specific port on an IP."""
    try:
        conn = asyncio.open_connection(ip, port)
        reader, writer = await asyncio.wait_for(conn, timeout=timeout)
        writer.close()
        await writer.wait_closed()
        return True
    except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
        return False
    except Exception as e:
        logger.debug(f"Unexpected error checking {ip}:{port} - {e}")
        return False

async def scan_host(ip: str) -> bool:
    """Scans a single host to see if any Windows-related ports are open with a fallback."""
    # RDP 3389 primary detection
    if await check_port(ip, 3389):
        return True
        
    # SMB 445 fallback
    if await check_port(ip, 445):
        return True
        
    return False

async def scan_subnet_async(subnet: str):
    """Asynchronously scans all hosts in a subnet using a semaphore to limit concurrency."""
    logger.info(f"Starting discovery scan on subnet: {subnet}")
    network = ipaddress.ip_network(subnet, strict=False)
    
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    discovered_ips = []
    
    async def sem_scan(ip_obj):
        ip_str = str(ip_obj)
        async with semaphore:
            if await scan_host(ip_str):
                discovered_ips.append(ip_str)

    # Exclude network and broadcast addresses
    tasks = [sem_scan(ip) for ip in network.hosts()]
    await asyncio.gather(*tasks)
    
    logger.info(f"Discovery scan completed on {subnet}. Found {len(discovered_ips)} live hosts.")
    return discovered_ips

def run_discovery_scan(subnet: str, server_url: str, agent_hostname: str):
    """
    Wrapper to run the async discovery scan synchronously and 
    report findings back to the server, filtering out existing assets (Shadow Asset Detection).
    """
    try:
        discovered_ips = asyncio.run(scan_subnet_async(subnet))
    except ValueError as e:
        logger.error(f"Invalid subnet provided for discovery: {e}")
        return

    # Fetch currently registered agents from the backend to identify shadow assets
    known_agents_ips = []
    try:
        res = requests.get(f"{server_url}/api/v1/agents/", timeout=10)
        if res.status_code == 200:
            known_agents_ips = [a.get("ip_address") for a in res.json()]
    except Exception as e:
        logger.warning(f"Could not fetch known agents to verify shadow assets: {e}")

    discovery_url = f"{server_url}/api/v1/discovery/"
    
    for ip in discovered_ips:
        # If it's already a managed agent, skip it to avoid cluttering discovery logs
        if ip in known_agents_ips:
            continue
            
        # Try to resolve hostname; this can be slow, so we timeout quickly or pass None
        try:
            target_hostname = socket.gethostbyaddr(ip)[0]
        except Exception:
            target_hostname = None
            
        payload = {
            "ip_address": ip,
            "hostname": target_hostname,
            "subnet": subnet,
            "discovered_by": agent_hostname
        }
        
        try:
            response = requests.post(discovery_url, json=payload, timeout=5)
            if response.status_code != 200:
                logger.warning(f"Failed to report shadow asset {ip}: {response.text}")
            else:
                logger.info(f"Reported new unmanaged shadow asset found: {ip}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to server to report discovery: {e}")
