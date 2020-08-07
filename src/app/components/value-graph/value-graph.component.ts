import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import {DbconService, GeneData, PlatformData, SeriesData, SampleData} from "../../services/data-retreival/dbcon.service"
import { Subject } from 'rxjs';
import * as jstat from "jstat";

@Component({
  selector: 'app-value-graph',
  templateUrl: './value-graph.component.html',
  styleUrls: ['./value-graph.component.scss']
})
export class ValueGraphComponent implements OnInit {

  private valueEmitter = new Subject<GeneValueInfo>();
  private seriesEmitter = new Subject<SeriesValueInfo>();

  public graph = {
    data: [
        { x: [], y: [], type: 'scatter', mode: "markers"},
    ],
    layout: {width: 1000, height: 1000, title: 'A Fancy Plot'}
  };

  data = { x: [], y: [], type: 'scatter', mode: "markers"};

  constructor(private dbcon: DbconService, private ngZone: NgZone, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    let testSym = "Bap18";
    this.getDataFromSymbol(testSym);
    let intervalSet = false;

    // setTimeout(() => {
    //   this.graph.data[0].x.push(1);
    //   this.graph.data[0].y.push(2);
    // }, 20000);

    // this.valueEmitter.asObservable().subscribe((value: GeneValueInfo) => {
    //   console.log(value);
    // });

    this.seriesEmitter.asObservable().subscribe((seriesInfo: SeriesValueInfo) => {
      // console.log(seriesInfo);
      //use all values for population
      let population = [];
      let popAcc = 0;
      //use average of values in sample if multiples for sample values
      let values = [];
      for(let sample of seriesInfo.gsms) {
        let acc = 0;
        for(let value of sample.values) {
          population.push(value);
          acc += value;
          popAcc += value;
        }
        let avg = acc / sample.values.length;
        values.push(acc);
      }
      let popAvg = popAcc / population.length;
      for(let value of values) {
        let rat = value / popAvg;
        let lograt = Math.log2(rat);
        let p = jstat.ttest(value, population);
        let logp = -Math.log10(p);
        if(!Number.isNaN(p) && !Number.isNaN(lograt)) {
          // dataPoints.push([lograt, p]);
          this.data.x.push(lograt);
          this.data.y.push(logp);

          // console.log(this.graph.data[0].x, this.graph.data[0].y);
        }

      }
      if(!intervalSet) {
        this.triggerChanges();
        intervalSet = true;
      }

      // this.ngZone.run(() => {

      // });
    });


    this.test();
  }

  triggerChanges() {
    setInterval(() => {
      this.ngZone.run(() => {
        this.graph.data = [JSON.parse(JSON.stringify(this.data))];
      });
    }, 1000);
  }

  //the "value" must be the hypothesized population mean
  test() {
    console.log(jstat.ttest);
    let p = jstat.ttest(2.1, [12, 2, 1, 1.3, 3, 2.1, 5]);
    console.log(p);
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
              let seriesInfo: SeriesValueInfo = {
                geneSymbol: geneSymbol,
                  geneSynonyms: geneSynonyms,
                  geneDescription: geneDescription,
                  gpl: gpl,
                  gse: gse,
                  gsms: sampleData
              }
              this.seriesEmitter.next(seriesInfo);

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



  //state of the population of values, should all be in log ratios
  popState = {
    n: 0,
    tot: 0,
    vals: [],
    average: 0
  }

  addValsToPop(vals: number[]) {
    this.popState.n += vals.length;
    for(let val of vals) {
      this.popState.tot += val;
    }
    this.popState.average = this.popState.tot / this.popState.n
  }


  getAvgs(seriesData: SeriesValueInfo): {avg: number, subAvgs: number[]} {

    let subAvgs = [];
    let acc = 0;
    for(let sample of seriesData.gsms) {
      let subAcc = 0;
      for(let value of sample.values) {
        subAcc += value;
      }
      let subAvg = subAcc / sample.values.length;
      subAvgs.push(subAvg);
      acc += subAvg;
    }
    let avg = acc / seriesData.gsms.length;

    let avgs = {
      avg: avg,
      subAvgs: subAvgs
    };
    return avgs;
  }


  getLogRatios(avgs: {avg: number, subAvgs: number[]}): number[] {
    let ratios = [];

    for(let subAvg of avgs.subAvgs) {
      let ratio = subAvg / avgs.avg;
      let lograt = Math.log2(ratio);
      ratios.push(lograt);
    }

    return ratios;
  }

  //There is a long-standing convention in biology that P-values that are ≤0.05 are considered to be significant,

  getPVals(lograts: number[]) {

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


export interface SeriesValueInfo {
  geneSymbol: string,
  geneSynonyms: string[],
  geneDescription: string,
  gpl: string,
  gse: string,
  gsms: SampleData[]
}
