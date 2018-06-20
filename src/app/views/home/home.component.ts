import {Component, OnInit} from '@angular/core';
import {LocationStrategy, PlatformLocation, Location} from '@angular/common';
import {LegendItem, ChartType} from '../../lbd/lbd-chart/lbd-chart.component';
import * as Chartist from 'chartist';
import {JoinedDetailServiceService} from '../../services/joined-detail-service.service';
import {AnalystServiceService} from '../../services/analyst-service.service'
import {TransactionsServiceService} from '../../services/transactions-service.service'
import { User } from '../../models/user';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Trend } from '../../models/trend';
import 'rxjs/add/operator/mergeMap';
import { BrokerServiceService } from '../../services/broker-service.service';
import { BrokerTransaction } from '../../models/brokerTransaction';

declare interface TableData {
  headerRow : string[];
  dataRows : string[][];
}

@Component({selector: 'app-home', templateUrl: './home.component.html', styleUrls: ['./home.component.css']})
export class HomeComponent implements OnInit {

  public tableData1 : TableData;
  public tableData2 : TableData;

  private currentUser: User = null
  private rowData: Observable<Trend[]>;
  private rowData2: any;
  private currentRound: number;
  private portfolio: Observable<BrokerTransaction[]>;

  constructor(
    private joinedDetailServiceService : JoinedDetailServiceService, 
    private analystServiceService: AnalystServiceService,
    private transactionsServiceService: TransactionsServiceService,
    private brokerServiceService: BrokerServiceService
  ) {
    console.log(this.joinedDetailServiceService.getUsers());

    this.currentUser = this.joinedDetailServiceService.getCurrentUser();

    this.tableData1 = {
      headerRow: [
        'Action', 'Duration', 'Sector',  'Type'
      ],
      dataRows: null
    };

    this.rowData = this.analystServiceService.getAnalystData(this.currentUser,0,JSON.parse(localStorage.getItem("userData")).gameId);

    this.rowData2 = JSON.parse(localStorage.getItem("userData")).round.stocks;
    this.currentRound = JSON.parse(localStorage.getItem("userData")).currentRound;

    this.portfolio = this.brokerServiceService.portfolio(this.currentUser.Name);

    console.log(this.rowData2);

    this.tableData2 = {
      headerRow: [
        'Company', 'Sector', 'Price', 'Action'
      ],
      dataRows: this.rowData2 
    };
  }

  ngOnInit() {}

  public buyShare(price: any, company: string){
    const { accountNumber, Name } = this.currentUser;
    
    this.transactionsServiceService.transaction('debit',String(price),String(accountNumber), 'buying').flatMap(response=>{
      return this.brokerServiceService.bTransaction(Name,company,1,'buy',price,this.currentRound);
    }).subscribe(data => {
      console.log(data);
      alert('you have succefully bought!');
    });
  }

  public sellShare(price: any, company: string){
    const { accountNumber, Name } = this.currentUser;
    this.brokerServiceService.bTransaction(Name,company,1,'sell',price,this.currentRound).flatMap(response=>{
      return this.transactionsServiceService.transaction('credit',String(price),String(accountNumber), 'selling');
    }).subscribe(data => {
      console.log(data);
      alert('you have succefully sell a stock!');
    });
  }


}
