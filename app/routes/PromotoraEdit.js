import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Modal, Row, Col, ModalHeader, ModalBody, ModalFooter,Container,Button,FormGroup,Input,Label } from 'reactstrap';
import AppNavbar from './AppNavbar';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import FileBase64 from 'react-file-base64';

class PromotoraEdit extends Component {

  emptyItem = {
    nombre: '',
    apellido: '',
    fechaNacimiento: null,
    documento: '',
    tipoDocumento: null,
    direccion: '',
    zona: null,
    celular: '',											
    emergencia: '',
    facebook: '',
    instagram: '',
    esNutricionista: false,
    esMedica: false,
    esKinesiologa: false,
    fotos: []
  };

  constructor(props) {
    super(props);
    this.state = {
      item: this.emptyItem
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== 'new') {
      const empresa = await (await fetch(`/api_empresa/empresa/${this.props.match.params.id}`)).json();
      
      this.setState({item: empresa});
    }
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let item = {...this.state.item};
    item[name] = value;
    this.setState({item});
  }
  
  
    getFiles(files){
    let item = {...this.state.item};
    let cant = files.length;
	for (var i=0; i < cant; i++){
    let file = (files[i].base64);
	const fileString = JSON.stringify(file);

    item["fotos"].push(JSON.parse(fileString));
	}
    this.setState({item});
  }
      

  handleRadio(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let item = {...this.state.item};
    item[name] = value==='on' ? true:false;
    this.setState({item});
  }
  

  async handleSubmit(event) {
    event.preventDefault();
    const {item} = this.state;

    await fetch((item.id) ? '/api_empresa/empresa/'+(item.id) : '/api_promotora/promotora',{
      method: (item.id) ? 'PUT' : 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item),
      
    });
    this.props.history.push('/empresas');
  }
  
//  async handleSubmit(event) {
//	    event.preventDefault();
//	    const {item} = this.state;
//
//	    await fetch('/api_empresa/empresa', {
//	    	
//	      method: (item.id) ? 'PUT' : 'POST',
//	      headers: {
//	        'Accept': 'application/json',
//	        'Content-Type': 'application/json'
//	      },
//	      body: JSON.stringify(item),
//	    });
//	    this.props.history.push('/empresas');
//	  }

  render() {
    const {item} = this.state;
    const title = <h2>{item.id ? 'Editar Promotora' : 'Registrate!'}</h2>;

    return <div>
      <AppNavbar/>
      <Container>
        {title}
        
      <AvForm onValidSubmit={this.handleSubmit} onInvalidSubmit={this.handleInvalidSubmit}>
      
      <Row>
      <Col xs="12" sm="4">
        <AvField 
        	name="nombre" 
        	label="Nombre"  
        	type="text"
        	required 
        	onChange={this.handleChange} 
        	value={item.nombre || ''}
        	errorMessage="Elegi un nombre"
        	/>
        </Col>
        <Col xs="12" sm="4">
        <AvField 
            name="apellido" 
            label="Apellido"  
            type="text"
            required 
            onChange={this.handleChange} 
            value={item.apellido || ''}
            errorMessage="Elegi un Apellido"
            />		
         </Col>
        <Col xs="12" sm="4">
        <AvField name="fechaNacimiento" 
        label="Nacimiento" 
        type="date" 
        required 
        errorMessage="Elegi Fecha Nac." 
        onChange={this.handleChange} />
        </Col>
        </Row>
        
        <Row>
		<Col xs="12" sm="2">
         <AvField 
            name="tipoDocumento" 
            label="Tipo"  
            type="select"
            required
            onChange={this.handleChange} 
            value={item.tipoDocumento || ''}
            errorMessage="Elegi un Tipo Doc."
            >
            <option value=''></option>
            <option>DU</option>
            <option>PAS</option>
            <option>LR</option>
          </AvField>
        </Col>
        
        <Col xs="12" sm="2">
           <AvField 
            name="documento" 
            label="Documento"  
            type="number"
            required 
            onChange={this.handleChange} 
            value={item.documento || ''}
            errorMessage="Elegi un documento"
            />
         </Col>
         
         <Col xs="12" sm="4">
         <AvField 
            name="mail" 
            label="Mail"  
            type="text"
            required 
            onChange={this.handleChange} 
            value={item.mail || ''}
            errorMessage="Elegi un Mail"
            />		
       
         </Col>
         
         <Col xs="12" sm="4">
         <AvField 
            name="facebook" 
            label="Facebook"  
            type="text"
            onChange={this.handleChange} 
            value={item.facebook || ''}
            errorMessage="Elegi FB"
            />
             
          </Col>
       </Row>
       
      <Row>
      <Col xs="12" sm="4">
        <AvField 
        	name="celular" 
        	label="Celular"  
        	type="text"
        	required 
        	onChange={this.handleChange} 
        	value={item.celular || ''}
        	errorMessage="Elegi un celular"
        	/>
        </Col>
        
        <Col xs="12" sm="4">
        <AvField 
            name="emergencia" 
            label="Tel Emergencias"  
            type="text"
            required 
            onChange={this.handleChange} 
            value={item.emergencia || ''}
            errorMessage="Elegi un Numero por emergencias"
            />		
         </Col>
        <Col xs="12" sm="4">
           <AvField 
            name="instagram" 
            label="Instagram"  
            type="text"
            onChange={this.handleChange} 
            value={item.instagram || ''}
            errorMessage="Elegi Instagram"
            />
       
         </Col>
        </Row>
            	
       <Row>
		<Col xs="12" sm="8">
         <AvField 
            name="direccion" 
            label="Direccion"  
            type="text"
            required
            onChange={this.handleChange} 
            value={item.direccion || ''}
            errorMessage="Elegi una direccion"
            />
        </Col>
        
        <Col xs="12" sm="4">
            <AvField 
            name="zona" 
            label="Zona"  
            type="select"
            required 
            onChange={this.handleChange} 
            value={item.zona || ''}
            errorMessage="Elegi una zona"
            >
            <option value=''></option>
            <option>CABA</option>
            <option>Norte</option>
            <option>Oeste</option>
            <option>Este</option>
            <option>Sur</option>
            </AvField> 
            </Col>
            </Row>
  
         <Row>    
         <FormGroup check inline>
          <Label check for="esNutricionista" >
            <Input type="checkbox" onChange={this.handleRadio} name="esNutricionista" /> Nutricionista
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label check for="esMedicaString" >
             <Input type="checkbox" onChange={this.handleRadio} name="esMedica"/> Medicina
          </Label>
        </FormGroup>
          <FormGroup check inline>
          <Label check for="esKinesiologa" >
             <Input type="checkbox" onChange={this.handleRadio} name="esKinesiologa"/> Kinesiología
          </Label>
        </FormGroup>
        </Row> 
        
        <div>
        <input type="file" onChange={this.fileSelectedHandler}/>
        </div>
        
        <FileBase64
        multiple={ true }
        onDone={ this.getFiles.bind(this) } />
            	
        <Button color="primary">Guardar</Button>{' '}
        <Button color="secondary" tag={Link} to="/empresas">Cancelar</Button>
      </AvForm>

      </Container>
    </div>
  }
}

export default withRouter(PromotoraEdit);
