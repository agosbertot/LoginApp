import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.models';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
  //gracias a esto provideIn: root , no necesito importarlo en el appModule porque ya esta probehido de forma flobal
})
export class AuthService {

  private url = 'https://identitytoolkit.googleapis.com/v1';
  private apiKey = 'AIzaSyBMmIBgZG5XOaJ2t_CfLwrut_Yg79jk8NA';

   //Para cear nuevo usuario
  //https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]
  
  //Login
  //https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]
  
  userToken: string;

  constructor(private http: HttpClient) {

    this.leerToken();
    
   }

  logout(){
    localStorage.removeItem('token');
  }

  login( usuario: UsuarioModel){

    const authData = {
      email: usuario.email,
      password: usuario.password,
      returnSecureToken: true
    };

    return this.http.post(
      `${this.url}/accounts:signInWithPassword?key=${ this.apiKey }`,
      authData).pipe(
        map( resp => {
          // el map no se dispara si hay un error
          this.guardarToken( resp['idToken'] );
          return resp;
        })
      );
  }

  nuevoUsuario( usuario: UsuarioModel){
    const authData = {
      email: usuario.email,
      password: usuario.password,
      returnSecureToken: true
    };

    return this.http.post(
      `${this.url}/accounts:signUp?key=${ this.apiKey }`, authData).pipe(
        map( resp => {
          // el map no se dispara si hay un error
          this.guardarToken( resp['idToken'] );
          return resp;
        })
      );
  }

  private guardarToken( idToken: string ){
    this.userToken = idToken;
    localStorage.setItem('token', idToken);

    let hoy = new Date(); 
    hoy.setSeconds( 3600 );
    localStorage.setItem ('expira', hoy.getTime().toString());
  }

  leerToken(){
    if (localStorage.getItem('token')) {
      //si el token existe lo lee del localStorage, sino le asiga un strign vacio
      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }

    return this.userToken;
  }

estaAutenticado(): boolean{

  if ( this.userToken.length < 2){
    return false;
  }

  const expira = Number (localStorage.getItem('expira'));
  const expiraDate = new Date();
  expiraDate.setTime (expira);

  if ( expiraDate > new Date()){ return true;}
  else { return false; }
}

}
