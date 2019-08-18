import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MarkdownTagService } from './md-tag.service';
import { NgMarkdownComponent } from './ng-markdown.component';
import { MarkdownPreviewService } from './md-preview.service';

@NgModule({
  declarations: [
    NgMarkdownComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    MarkdownTagService,
    MarkdownPreviewService,
  ],
  exports:[
    NgMarkdownComponent,
  ]
})
export class NgMarkdownModule {

}