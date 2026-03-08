# web3_operations.py
from web3 import Web3
from datetime import datetime
import json
import base64
import logging
import os

logger = logging.getLogger(__name__)

# Network Configuration
NETWORK = os.getenv('NETWORK', 'ganache')  # 'ganache', 'sepolia', or 'mainnet'

NETWORKS = {
    'ganache': {
        'rpc_url': 'http://127.0.0.1:7545',
        'contract_address': '0xBcbaCf69790d1Fe332b26215EE2C9A308f84A247',
        'chain_id': 1337,
    },
    'sepolia': {
        'rpc_url': f"https://sepolia.infura.io/v3/{os.getenv('INFURA_KEY')}",
        'contract_address': os.getenv('SEPOLIA_CONTRACT_ADDRESS'),
        'chain_id': 11155111,
    },
    'mainnet': {
        'rpc_url': f"https://mainnet.infura.io/v3/{os.getenv('INFURA_KEY')}",
        'contract_address': os.getenv('MAINNET_CONTRACT_ADDRESS'),
        'chain_id': 1,
    }
}

# Get current network config
network_config = NETWORKS[NETWORK]

# Initialize Web3
webs = Web3(Web3.HTTPProvider(network_config['rpc_url']))

print(f"\n{'='*80}")
print(f"🌐 BLOCKCHAIN NETWORK CONFIGURATION")
print(f"{'='*80}")
print(f"Network: {NETWORK.upper()}")
print(f"RPC URL: {network_config['rpc_url']}")
print(f"Contract Address: {network_config['contract_address']}")
print(f"Chain ID: {network_config['chain_id']}")
print(f"Connected: {webs.is_connected()}")
if webs.is_connected():
    print(f"Latest Block: {webs.eth.block_number}")
print(f"{'='*80}\n")

# Load contract
with open("Blocks/build/contracts/Store.json") as d:
    contract_data = json.load(d)
    contract = webs.eth.contract(
        address=network_config['contract_address'],
        abi=contract_data["abi"]
    )


def get_network_info():
    """Get current network information"""
    return {
        'network': NETWORK,
        'rpc_url': network_config['rpc_url'],
        'contract_address': network_config['contract_address'],
        'chain_id': network_config['chain_id'],
        'connected': webs.is_connected(),
        'latest_block': webs.eth.block_number if webs.is_connected() else None
    }


def addData(data: dict, user_id: int, wallet_address: str, category: str = "general") -> dict:
    """
    Add data to blockchain (works on any network)
    """
    try:
        # Add metadata
        data_with_meta = {
            **data,
            "user_id": user_id,
            "category": category,
            "network": NETWORK,  # Track which network
            "created_at": datetime.now().isoformat(),
        }
        
        # Encode
        encoded = base64.b64encode(json.dumps(data_with_meta).encode()).decode()
        
        print(f"\n{'='*80}")
        print(f"📝 ADDING DATA TO {NETWORK.upper()}")
        print(f"{'='*80}")
        print(f"👤 User ID: {user_id}")
        print(f"💰 Wallet: {wallet_address}")
        print(f"🌐 Network: {NETWORK}")
        print(f"📍 Contract: {network_config['contract_address']}")
        print(f"{'='*80}\n")
        
        # Build transaction
        tx_config = {"from": wallet_address}
        
        # For non-Ganache networks, add gas settings
        if NETWORK != 'ganache':
            # Get gas price
            gas_price = webs.eth.gas_price
            tx_config['gasPrice'] = gas_price
            
            # Estimate gas
            gas_estimate = contract.functions.addString(encoded).estimate_gas(tx_config)
            tx_config['gas'] = int(gas_estimate * 1.2)  # Add 20% buffer
            
            print(f"⛽ Gas Price: {webs.from_wei(gas_price, 'gwei')} Gwei")
            print(f"⛽ Gas Limit: {tx_config['gas']}")
            print(f"💰 Estimated Cost: {webs.from_wei(gas_price * tx_config['gas'], 'ether')} ETH\n")
        
        # Execute transaction
        tx_hash = contract.functions.addString(encoded).transact(tx_config)
        
        # Wait for confirmation
        print(f"⏳ Waiting for confirmation...")
        receipt = webs.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"\n{'='*80}")
        print(f"✅ DATA ADDED TO {NETWORK.upper()}")
        print(f"{'='*80}")
        print(f"🔗 TX Hash: {tx_hash.hex()}")
        print(f"📦 Block: {receipt['blockNumber']}")
        print(f"⛽ Gas Used: {receipt['gasUsed']}")
        print(f"✅ Status: {'Success' if receipt['status'] == 1 else 'Failed'}")
        print(f"{'='*80}\n")
        
        return {
            "success": True,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt['blockNumber'],
            "gas_used": receipt['gasUsed'],
            "network": NETWORK,
            "contract_address": network_config['contract_address']
        }
        
    except Exception as e:
        logger.error(f"❌ Add data error on {NETWORK}: {e}")
        return {
            "success": False,
            "error": str(e),
            "network": NETWORK
        }