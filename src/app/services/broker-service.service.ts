import {Injectable} from '@angular/core';
import {Subscription, Observable} from 'rxjs';
import {Http, Response} from '@angular/http';
import {BrokerTransaction} from '../models/brokerTransaction';

@Injectable()
export class BrokerServiceService {
  // localhost:9000/api/transaction/history
  constructor(private http : Http) {}

  public bTransaction(name : string ,stock : string, quantity : number, type : string, price : number, turn : number) : Observable < Response > {
    return this
      .http
      .post('https://hidden-badlands-21838.herokuapp.com/api/transaction/', {name, stock, quantity, type, price, turn})
  }

  public portfolio(user : string) : Observable < BrokerTransaction[] > {
    return this
      .http
      .get('https://hidden-badlands-21838.herokuapp.com/api/transaction/portfolio/' + user)
      .map(res => {
        console.log(res);
        return res
          .json()
          .map(item => {
            console.log(item);
            return new BrokerTransaction(item.type, item.quantity, item.name, item.stock, item.price, item.turn);
          });
      });
  }
}
