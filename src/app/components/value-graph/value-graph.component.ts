import { Component, OnInit } from '@angular/core';
import {DbconService, GeneData, PlatformData, SeriesData, SampleData} from "../../services/data-retreival/dbcon.service"
import { Subject } from 'rxjs';

@Component({
  selector: 'app-value-graph',
  templateUrl: './value-graph.component.html',
  styleUrls: ['./value-graph.component.scss']
})
export class ValueGraphComponent implements OnInit {

  private valueEmitter = new Subject<GeneValueInfo>();

  constructor(private dbcon: DbconService) { }

  ngOnInit(): void {
    let testSym = "Bap18";
    // this.getDataFromSymbol(testSym);

    this.valueEmitter.asObservable().subscribe((value: GeneValueInfo) => {

    });
  }


  // assume normal distribution between all gene expression data
  // expected value would be "control" baseline
  // use this control baseline within series data

  //assume upregulation +, downregulation -
  //0 baseline
  //statistical significance limit estimate based on intraseries data (how statistically significant was the sample relative to other samples under similar conditions)
  



  //probably replace this with a listener to an event system since going to want this data from multiple places
  //fine for now though
  private getDataFromSymbol(symbol): void {
    this.dbcon.getValuesFromGeneSymbol(symbol).then((geneData: GeneData) => {
      let geneSymbol: string = geneData.geneSymbol;
      let geneSynonyms: string[] = geneData.geneSynonyms;
      let geneDescription: string = geneData.geneDescription;
      for(let gplData of geneData.platformData) {
        let gpl: string = gplData.gpl;
        gplData.seriesData.then((seriesData: SeriesData[]) => {
          for(let gseData of seriesData) {
            let gse: string = gseData.gse;
            gseData.sampleData.then((sampleData: SampleData[]) => {
              for(let gsmData of sampleData) {
                let gsm: string = gsmData.gsm;
                let values: number[] = gsmData.values;
                let valueInfo: GeneValueInfo = {
                  geneSymbol: geneSymbol,
                  geneSynonyms: geneSynonyms,
                  geneDescription: geneDescription,
                  gpl: gpl,
                  gse: gse,
                  gsm: gsm,
                  values: values
                }
                this.valueEmitter.next(valueInfo);
              }
            });
          }
        });
      }
    });
  }
}

//going to want to move the value packing/emitting to another service !!
export interface GeneValueInfo {
  geneSymbol: string,
  geneSynonyms: string[],
  geneDescription: string,
  gpl: string,
  gse: string,
  gsm: string,
  values: number[]
}