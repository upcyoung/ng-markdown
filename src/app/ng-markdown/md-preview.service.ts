import { Injectable } from "@angular/core";
import { EditorView } from "prosemirror-view"
import { EditorState } from "prosemirror-state"
import { defaultMarkdownParser, defaultMarkdownSerializer } from "prosemirror-markdown"
import { of } from 'rxjs';
import { tap } from 'rxjs/operators'
import * as mermaid from 'mermaid';

const MAX_CHAR_LIMIT = 5000;

@Injectable()
export class MarkdownPreviewService {


  constructor() {
    mermaid.default.initialize({
      // mermaid core options
      startOnLoad: false,
      // mermaidAPI options
      theme: 'neutral',
      flowchart: {
        htmlLabels: false,
      },
    });
  }

  private renderMermaid(view: HTMLElement) {
    const els = view.querySelectorAll('[data-params="mermaid"]');
    els.forEach((el, i) => {
      const source = el.textContent;

      /**
       * Restrict the rendering to a certain amount of character to
       * prevent mermaidjs from hanging up the entire thread and
       * causing a DoS.
       */
      if (source && source.length > MAX_CHAR_LIMIT) {
        el.textContent = `Cannot render the image. Maximum character count (${MAX_CHAR_LIMIT}) has been exceeded.`;
        return;
      }

      // Remove any extra spans added by the backend syntax highlighting.
      // Object.assign(el, { textContent: source });

      // const container = document.createElement('div');
      // container.setAttribute('id', `mermaid-${i}`);
      // // // pre > code > svg
      // el.replaceWith(container);


      mermaid.default.mermaidAPI.render(`mermaid-${Math.random().toString(32).slice(2)}-${i}`, source, (code) => {
        el.innerHTML = code;


        // // We need to add the original source into the DOM to allow Copy-as-GFM
        // // to access it.
        // const sourceEl = document.createElement('text');
        // sourceEl.classList.add('source');
        // sourceEl.setAttribute('display', 'none');
        // sourceEl.textContent = source;

        // container.querySelector('svg').appendChild(sourceEl);

      });
    });
  }

  preview(content: string) {
    const target = document.createElement('div');
    // target.style.display = 'none';
    // document.body.append(target);
    

    const view = new EditorView(target, {
      state: EditorState.create({
        doc: defaultMarkdownParser.parse(content),
      })
    });
    target.innerHTML = view.dom.outerHTML;
    this.renderMermaid(target);
    return of(target.outerHTML.replace('contenteditable="true"', '')).pipe(tap(() => {
      view.destroy();
      // document.body.removeChild(target);
    }));
  } 
}