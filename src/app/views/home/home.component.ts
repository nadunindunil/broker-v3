import { Component, OnInit } from '@angular/core';
import { LocationStrategy, PlatformLocation, Location } from '@angular/common';
import { LegendItem, ChartType } from '../../lbd/lbd-chart/lbd-chart.component';
import * as Chartist from 'chartist';
import { JoinedDetailServiceService } from '../../services/joined-detail-service.service';
import { AnalystServiceService } from '../../services/analyst-service.service';
import { TransactionsServiceService } from '../../services/transactions-service.service';
import { User } from '../../models/user';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Trend } from '../../models/trend';
import 'rxjs/add/operator/mergeMap';
import { BrokerServiceService } from '../../services/broker-service.service';
import { BrokerTransaction } from '../../models/brokerTransaction';
import { SimulatorServiceService } from '../../services/simulator-service.service';
import { GameServiceService } from '../../services/game-service.service';

declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({ selector: 'app-home', templateUrl: './home.component.html', styleUrls: ['./home.component.css'] })
export class HomeComponent implements OnInit {
  public tableData1: TableData;
  public tableData2: TableData;
  public tableData3: TableData;

  private currentUser: User = null;
  private rowData: Observable<Trend[]>;
  private userBalance: Observable<any>;
  private rowData2: any;
  private currentRound: number;
  private portfolio: Observable<BrokerTransaction[]>;

  constructor(
    private joinedDetailServiceService: JoinedDetailServiceService,
    private analystServiceService: AnalystServiceService,
    private transactionsServiceService: TransactionsServiceService,
    private brokerServiceService: BrokerServiceService,
    private simulatorServiceService: SimulatorServiceService,
    private gameServiceService: GameServiceService
  ) {
    console.log(this.joinedDetailServiceService.getUsers());

    // listen to user change
    this.joinedDetailServiceService.currentUser.subscribe(value => {
      this.currentUser = value;
      console.log(value);
      this.uiChange();
    });

    // when next turn clicked
    this.simulatorServiceService.userDetails.subscribe(value => {
      console.log(value);
      this.rowData2 = value.round.stocks;
      this.currentRound = value.currentRound;

      this.rowData = this.analystServiceService.getAnalystData(
        this.currentUser,
        value.currentRound,
        JSON.parse(localStorage.getItem('userData')).gameId
      );
    });

    this.tableData1 = {
      headerRow: ['Action', 'Duration', 'Sector', 'Type'],
      dataRows: null
    };

    this.tableData2 = {
      headerRow: ['Company', 'Sector', 'Price', 'Action'],
      dataRows: null
    };

    this.tableData3 = {
      headerRow: ['Company', 'Quantity', 'Action'],
      dataRows: null
    };
  }

  public async uiChange() {
    const { accountNumber, Name } = this.currentUser;
    this.portfolio = this.brokerServiceService.portfolio(this.currentUser.Name);
    this.userBalance = this.transactionsServiceService.getBalance(accountNumber);
    await this.gameServiceService.checkWinner();
  }

  public nextTurn() {
    this.simulatorServiceService.makeNextTurn();
  }

  ngOnInit() {}

  public buyShare(price: any, stock: string) {
    const { accountNumber, Name } = this.currentUser;

    const stockPrice = this.simulatorServiceService.getCurrentStockPrices(stock);
    console.log(stockPrice);
    this.transactionsServiceService
      .transaction('debit', String(price), String(accountNumber), 'buying')
      .flatMap(response => {
        return this.brokerServiceService.bTransaction(Name, stock, 1, 'buy', price, this.currentRound);
      })
      .subscribe(data => {
        console.log(data);
        alert('you have succefully bought!');
        this.uiChange();
      });
  }

  public sellShare(price: any, company: string) {
    const { accountNumber, Name } = this.currentUser;
    this.brokerServiceService
      .bTransaction(Name, company, 1, 'sell', price, this.currentRound)
      .flatMap(response => {
        return this.transactionsServiceService.transaction('credit', String(price), String(accountNumber), 'selling');
      })
      .subscribe(data => {
        console.log(data);
        alert('you have succefully sell a stock!');
        this.uiChange();
      });
  }
}
