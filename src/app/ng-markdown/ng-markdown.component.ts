import { Component, OnInit, ViewChild, ElementRef, Sanitizer } from '@angular/core';
import * as autoSize from 'autosize';
import { MarkdownTagService } from './md-tag.service';
import { MarkdownPreviewService } from './md-preview.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ng-markdown',
  templateUrl: './ng-markdown.component.html',
  styleUrls: [
    `ng-markdown.scss`
  ]
})
export class NgMarkdownComponent implements OnInit {

  @ViewChild('autosize', { static: true }) textareaEle: ElementRef;

  editing = true;

  dom: SafeHtml;

  constructor(
    private tagService: MarkdownTagService,
    private previewSerice: MarkdownPreviewService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    autoSize(this.textareaEle.nativeElement);
    autoSize.update(this.textareaEle.nativeElement);


  }

  toEdit() {
    !this.editing ? this.editing = true : '';
  }

  toPreview() {
    if (this.editing) {
      this.editing = false;
      this.previewSerice.preview(this.textareaEle.nativeElement.value)
      .subscribe((html) => {
        this.dom = this.sanitizer.bypassSecurityTrustHtml(html);
      });
    }
  }

  addTag(tag: string) {
    this.tagService.updateText({ textArea: this.textareaEle.nativeElement, tag, wrap: true });
  }

}