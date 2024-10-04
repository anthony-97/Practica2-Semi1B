import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom'

import Login from '../Pages/login';
import AddUser from '../Pages/addUser';
import Inicio from '../Pages/inicio';
import CuentaConfig from '../Pages/configuracion';
import EditUser from '../Pages/editUser';
import RecFacial from '../Pages/recFacial';
import ConfigFacial from '../Pages/configFacial';

export default function Navegador(){
    return(
        <HashRouter>
            <Routes>
                <Route path="/" element ={<Login/>}/> {/*home*/}
                <Route path="/Login" element ={<Login/>}/> 
                <Route path="/AddUser" element ={<AddUser/>}/>
                <Route path="/Inicio/:email" element ={<Inicio/>}/>
                <Route path="/CuentaConfig/:email" element ={<CuentaConfig/>}/>
                <Route path="/EditUser/:email" element ={<EditUser/>}/>
                <Route path="/RecFacial/:email" element ={<RecFacial/>}/>
                <Route path="/ConfigFacial/:email" element ={<ConfigFacial/>}/>
            </Routes>
        </HashRouter>
    );
}