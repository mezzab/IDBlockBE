pragma solidity ^0.4.24;

contract IdentitiesBlock {

    mapping(uint => string) public clientInfoHash;

    mapping(uint => mapping (address => bool)) public ClientsEntitiesRelations;

    mapping(uint => bool) public InfoHashCreated;

    modifier ClientIsRelatedToEntity(uint dni, address Entity) {
        require(ClientsEntitiesRelations[dni][msg.sender] == true);
        _;
    }

    function setHash(uint dni,string ipfsHash) public
    {
        if(InfoHashCreated[dni] == false){
            clientInfoHash[dni] = ipfsHash;
            ClientsEntitiesRelations[dni][msg.sender] = true;
            InfoHashCreated[dni] = true;
        } else {
            ClientsEntitiesRelations[dni][msg.sender] = true;
        }
    }

    function getHash(uint dni) public view ClientIsRelatedToEntity(dni, msg.sender)
    returns(string)
    {
        return (clientInfoHash[dni]);
    }

}
