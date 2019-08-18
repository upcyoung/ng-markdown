import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgMarkdownComponent } from './ng-markdown/ng-markdown.component';
import { NgMarkdownModule } from './ng-markdown/ng-markdown.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgMarkdownModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
