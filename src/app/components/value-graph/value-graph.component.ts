import { Component, OnInit } from '@angular/core';
import {DbconService, GeneData} from "../../services/data-retreival/dbcon.service"

@Component({
  selector: 'app-value-graph',
  templateUrl: './value-graph.component.html',
  styleUrls: ['./value-graph.component.scss']
})
export class ValueGraphComponent implements OnInit {

  constructor(private dbcon: DbconService) { }

  ngOnInit(): void {
    let testSym = "Bap18";
    this.getDataFromSymbol(testSym);
  }

  //probably replace this with a listener to an event system since going to want this data from multiple places
  //fine for now though
  private getDataFromSymbol(symbol) {
    let valuePromise: GeneData = this.dbcon.getValuesFromGeneSymbol(symbol);
    // valuePromise.gpls.then((gpls: string[]) => {
    //   console.log(gpls);
    // })
    // valuePromise.gses
  }
}
