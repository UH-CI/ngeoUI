import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValueGraphComponent } from './components/value-graph/value-graph.component';

import { HttpClientModule } from "@angular/common/http";
import { SearchComponent } from './components/search/search.component';
import { GeneComponent } from './components/gene/gene.component';


import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    ValueGraphComponent,
    SearchComponent,
    GeneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    PlotlyModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
