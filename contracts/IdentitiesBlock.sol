pragma solidity ^0.4.24;

contract IdentitiesBlock {

    address creator; 

    function IdentitiesBlock() public {
        creator = msg.sender; 
    }

    //Relacion entre un DNI y el HASH IPFS que contiene la info
    mapping(uint => string) private clientInfoHash;

    //Relaciones que existen entre clientes(DNI) y entidades(ADDRESS). Devuelve true si existe la relacion
    mapping(uint => mapping (address => bool)) public ClientsEntitiesRelations;

    //Validacion si existe la relacion entre cliente y comercio (usado en la funcion getHash)
    modifier ClientIsRelatedToEntity(uint dni) {
        require(ClientsEntitiesRelations[dni][msg.sender] == true);
        _;
    }

    //Validacion para verificar que seamos nosotros (usado en la funcion setHash y en setRelation)
    modifier IsIdBlock(){
        require(msg.sender == creator);
        _;
    }

    function setHash(uint dni,string ipfsHash) public IsIdBlock()
    {   
        clientInfoHash[dni] = ipfsHash;
    }

    function setRelation(uint dni, address addr) public IsIdBlock()
    {
        ClientsEntitiesRelations[dni][addr] = true;
    }


    function getHash(uint dni) public view ClientIsRelatedToEntity(dni)
    returns(string)
    {
        return (clientInfoHash[dni]);
    }

}
