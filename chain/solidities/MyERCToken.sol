pragma solidity >=0.8.0;

contract MyERCToken {
  string public constant name = "My Custom ERC20 Token";
  string public constant symbol = "MET";
  uint8 public constant decimals = 18;
  /////////////////////////////////////////////////////////////////////////////
  //在本示例中，通证供给量是固定的，但也可以将其设定为可修改的
  uint256 _totalSupply = 1000000;
  
  //合约拥有者
  address public owner;
  //创建映射表来记录账户余额
  mapping (address => uint256) balances;

  constructor() public {
    owner = msg.sender;
    balances[msg.sender] = _totalSupply;
  }
  /////////////////////////////////////////////////////////////////////////////
  function totalSupply() public view returns (uint256 theTotalSupply) {
    //函数声明中已经定义了返回变量theTotalSupply
    theTotalSupply = _totalSupply;
    return theTotalSupply;
  }
  /////////////////////////////////////////////////////////////////////////////
  function balanceOf(address _owner) public view returns (uint256 balance) {
    //返回指定地址的通证余额
    return balances[_owner];
  }
  /////////////////////////////////////////////////////////////////////////////
  //创建映射表记录通证持有者、被授权者以及授权数量
  mapping(address => mapping (address => uint256)) allowed;

  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  function approve(address _spender, uint256 _amount) public returns (bool success) {
    allowed[msg.sender][_spender] = _amount;
    //当授权时触发Approval事件
    emit Approval(msg.sender, _spender, _amount);
    return true;
  }
	/////////////////////////////////////////////////////////////////////////////
  function allowance(address _spender) public view returns (uint256 remaining) {
    return allowed[msg.sender][_spender];//允许_spender从_owner中转出的token数
  }
  /////////////////////////////////////////////////////////////////////////////
  //返回值为true时，表示转账成功
  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  function transfer(address _to, uint256 _amount) payable public returns (bool success) {
    //如果发送方有足够的资金并且发送数量非0 ，则发送给指定地址
    if (balances[msg.sender] >= _amount 
      && _amount > 0
      && balances[_to] + _amount > balances[_to]) {
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        //触发Transfer事件
        emit Transfer(msg.sender, _to, _amount);
        return true;
      } else {
        return false;
      }
  }
  /////////////////////////////////////////////////////////////////////////////
  function transferFrom(address _from, address _to, uint256 _amount) payable public returns (bool success) {
    if (balances[_from] >= _amount
      && allowed[msg.sender][_from] >= _amount
      && _amount > 0
      && balances[_to] + _amount > balances[_to]) {
    balances[_from] -= _amount;
    balances[_to] += _amount;
    emit Transfer(_from, _to, _amount);
      return true;
    } else {
      return false;
    }
  }
}