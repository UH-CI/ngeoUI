import { Injectable } from '@angular/core';
import * as config from "src/assets/config.json"
import { Observable, throwError, Subscription, Subject } from 'rxjs';
import {HttpClient} from "@angular/common/http"
import { map, retry, catchError, mergeMap, retryWhen } from 'rxjs/operators';
import {Semaphore} from "../../models/Semaphore";

@Injectable({
  providedIn: 'root'
})
export class DbconService {

  private static readonly endpoints = {
    sym2info: "/api/v1/values/gene_info",
    gpl2gse: "/api/v1/values/gpl_gse",
    gse2vals: "/api/v1/values/gse_values"
  };

  private throttleSemaphore = new Semaphore(100);

  private apiBase: string;

  constructor(private http: HttpClient) {
    this.apiBase = config.apiBase
  }

  public getValuesFromGeneSymbol(symbol: string): Promise<GeneData> {
    console.log(symbol);
    //three part request
    return this.sym2info(symbol).then((info: any) => {
      //should do this in API instead? Especially if going to split synonyms into separate cols in table
      let geneSynArr = info.gene_synonyms.split(",");
      let gplData: PlatformData[] = [];

      for(let gpl in info.platforms) {

        let gseDataPromise: Promise<SeriesData[]> = this.gpl2gse(gpl).then((gses: string[]) => {

          let gseData: SeriesData[] = [];

          for(let gse of gses) {
            let gsmDataPromise: Promise<SampleData[]> = this.gse2value(gse, gpl, info.platforms[gpl]).then((values: any) => {
              let gsmData: SampleData[] = [];
              //actual values object nested under series tag
              values = values[gse];
              for(let gsm in values) {
                let gsmDataSingle: SampleData = {
                  gsm: gsm,
                  values: values[gsm]
                };
                gsmData.push(gsmDataSingle);
              }
              return gsmData;
            });

            let gseDataSingle: SeriesData = {
              gse: gse,
              sampleData: gsmDataPromise
            }

            gseData.push(gseDataSingle);
          }

          return gseData;


        });


        let gplDataSingle: PlatformData = {
          gpl: gpl,
          seriesData: gseDataPromise
        };

        gplData.push(gplDataSingle);
      }

      let geneData: GeneData = {
        geneSymbol: symbol,
        geneSynonyms: geneSynArr,
        geneDescription: info.gene_description,
        platformData: gplData
      };

      return geneData;
    });
  }



  private sym2info(symbol: string): Promise<any> {

    let ep = `${this.apiBase}${DbconService.endpoints.sym2info}`;

    let uri = `${ep}?symbol=${symbol}`;
    //encode just in case
    uri = encodeURI(uri);

    return this.getData(uri);
  }

  private gpl2gse(gpl: string): Promise<any> {

    let ep = `${this.apiBase}${DbconService.endpoints.gpl2gse}`;

    let uri = `${ep}?gpl=${gpl}`;
    //encode just in case
    uri = encodeURI(uri);

    return this.getData(uri);
  }

  private gse2value(gse: string, gpl: string, id_refs: string[]): Promise<any> {

    let ep = `${this.apiBase}${DbconService.endpoints.gse2vals}`;

    let idListStr = id_refs.join(",");

    let uri = `${ep}?gpl=${gpl}&gse=${gse}&id_refs=${idListStr}`;
    //encode just in case
    uri = encodeURI(uri);

    return this.getData(uri);
  }


  //note should handle 400 errors separately
  //means error in request, which probably means the resource doesn't exist, so just skip
  //figure out how to use retrywhen
  getData(uri: string): Promise<any> {
    return this.throttleSemaphore.acquire().then(() => {
      return new Promise<any>((resolve, reject) => {
        this.http.get<any>(uri)
        .pipe(
          retry(3),
          catchError((e: Error) => {
            return throwError(e);
          })
        )
        .toPromise()
        .then((data) => {
          this.throttleSemaphore.release();
          resolve(data);
        })
        .catch((e) => {
          this.throttleSemaphore.release();
          reject(e);
        });
      });
    });
  }
}


//need to throttle high numbers of requests
//ERR_INSUFFICIENT_RESOURCES

export interface GeneData {
  geneSymbol: string,
  geneSynonyms: string[],
  geneDescription: string,
  platformData: PlatformData[]
}

export interface PlatformData {
  gpl: string,
  seriesData: Promise<SeriesData[]>
}

export interface SeriesData {
  gse: string,
  sampleData: Promise<SampleData[]>
}

export interface SampleData {
  gsm: string,
  values: number[]
}
