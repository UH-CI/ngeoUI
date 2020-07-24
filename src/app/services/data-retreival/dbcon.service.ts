import { Injectable } from '@angular/core';
import * as config from "src/assets/config.json"
import { Observable, throwError, Subscription, Subject } from 'rxjs';
import {HttpClient} from "@angular/common/http"
import { map, retry, catchError, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DbconService {

  private static readonly endpoints = {
    sym2info: "/api/v1/values/gene_info",
    gpl2gse: "/api/v1/values/gpl_gse",
    gse2vals: "/api/v1/values/gse_values"
  };

  private apiBase: string;

  constructor(private http: HttpClient) {
    this.apiBase = config.apiBase
  }

  public getValuesFromGeneSymbol(symbol: string): Promise<GeneData> {
    console.log(symbol);

    return this.sym2info(symbol).then((info: any) => {
      //should do this in API instead? Especially if going to split synonyms into separate cols in table
      let geneSynArr = info.gene_synonyms.split(",");
      let platformSub = new Subject<PlatformData>();
      let geneData: GeneData = {
        geneSymbol: symbol,
        geneSynonyms: geneSynArr,
        geneDescription: info.gene_description,
        platformData: platformSub.asObservable()
      };

      for(let gpl in info.platforms) {
        this.gpl2gse(gpl).then((gses: string[]) => {
          let seriesSub = new Subject<SeriesData>();
          let gplData: PlatformData = {
            gpl: gpl,
            seriesData: seriesSub.asObservable()
          }
          platformSub.next(gplData);

          for(let gse of gses) {
            this.gse2value(gse, gpl, info.platforms[gpl]).then((values: any) => {
              let gseData: SeriesData = {
                gse: gse,

              };
              seriesSub.next()
            });
          }
        });
      }

      return geneData;

      console.log(info);
      for(let gpl in info.platforms) {
        console.log(gpl)
        this.gpl2gse(gpl).then((gses: string[]) => {
          console.log(gses);
          for(let gse of gses) {
            this.gse2value(gse, gpl, info.platforms[gpl]).then((values: any) => {
              console.log(gse, gpl, info.platforms[gpl])
              console.log(values);
            });
          }
        })
        .catch((e) => {
          console.log(e);
        });
      }
    }, (e) => {
      console.error(e);
      return null;
    });


    return null;
  }

  //three part request

  private sym2info(symbol: string): Promise<any> {

    let ep = `${this.apiBase}${DbconService.endpoints.sym2info}`;

    let uri = `${ep}?symbol=${symbol}`;
    //encode just in case
    uri = encodeURI(uri);

    return new Promise((resolve, reject) => {
      return this.http.get<any>(uri)
      .pipe(
        retry(3),
        catchError((e: Error) => {
          return throwError(e);
        })
      )
      .toPromise()
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        reject(e);
      });
    });
  }

  private gpl2gse(gpl: string): Promise<any> {

    let ep = `${this.apiBase}${DbconService.endpoints.gpl2gse}`;

    let uri = `${ep}?gpl=${gpl}`;
    //encode just in case
    uri = encodeURI(uri);

    return new Promise((resolve, reject) => {
      return this.http.get<any>(uri)
      .pipe(
        retry(3),
        catchError((e: Error) => {
          return throwError(e);
        })
      )
      .toPromise()
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        reject(e);
      });
    });
  }

  private gse2value(gse: string, gpl: string, id_refs: string[]): Promise<any> {

    let ep = `${this.apiBase}${DbconService.endpoints.gse2vals}`;

    let idListStr = id_refs.join(",");

    let uri = `${ep}?gpl=${gpl}&gse=${gse}&id_refs=${idListStr}`;
    //encode just in case
    uri = encodeURI(uri);

    return new Promise((resolve, reject) => {
      return this.http.get<any>(uri)
      .pipe(
        retry(3),
        catchError((e: Error) => {
          return throwError(e);
        })
      )
      .toPromise()
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        reject(e);
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
  platformData: Observable<PlatformData>
}

export interface PlatformData {
  gpl: string,
  seriesData: Observable<SeriesData>
}

export interface SeriesData {
  gse: string,
  sampleData: SampleData[]
}

export interface SampleData {
  gsm: string,
  values: number[]
}
