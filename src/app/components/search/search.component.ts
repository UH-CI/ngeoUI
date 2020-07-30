import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild("submitButton", {read: ElementRef}) submitButton: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  clickButton(): void {
    console.log(this.submitButton);
    this.submitButton.nativeElement.click();
  }

  submit(): void {
    console.log("submit");
  }
}
