from web3 import Web3
import json
import base64

webs = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
one = {"from": "0xe66477CaBAe9AFC35E421Ea5db5D3C2D2CC52708"}

with open("Blocks/build/contracts/Store.json") as d:
    contract = webs.eth.contract(
        address="0xBcbaCf69790d1Fe332b26215EE2C9A308f84A247", abi=json.load(d)["abi"]
    ).functions


def addData(data:dict)->str:
    try:
        encoded=base64.b64encode(json.dumps(data).encode()).decode()
        contract.addString(encoded).transact(one)
        return "Success"
    except Exception as e:
        return str(e)

def retriveData()->list:
    ff=[]
    try:
        view=contract.getAll().call(one)
        for i in view:
            dd=json.loads(base64.b64decode(i[1]).decode())
            dd['id']=i[0]
            ff.append(dd)
        return ff
    except Exception as _:
        return ff
    

def updateViewPoint(id:int,dd:dict)->str:
    try:
        for i in retriveData():
            if i['id'] == id:
                try:
                    del dd['id']
                except Exception as _:
                    ""
                contract.updateStore(id,base64.b64encode(json.dumps(dd).encode()).decode()).transact(one)
                return "Success"
        return "Failed to Updated"
    except Exception as e:
        return "Not Updated"