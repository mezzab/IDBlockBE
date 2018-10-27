pragma solidity ^0.4.24;

contract IdentitiesBlock {

    //Relacion entre un DNI y el hash IPFS que contiene la info
    mapping(uint => string) public clientInfoHash;

    //Relaciones que existen entre clientes(dni) y comercios(address). Devuelve true si existe la relacion
    mapping(uint => mapping (address => bool)) public ClientsEntitiesRelations;

    //Relacion entre un dni y si esta o no creado el hash ipfs
    mapping(uint => bool) public InfoHashCreated;

    //Validacion si existe la relacion entre cliente y comercio (usado en la funcion getHash)
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
