import { Injectable } from '@angular/core';

const LINK_TAG_PATTERN = '[{text}](url)';

function selectedText(text: string, textarea: HTMLTextAreaElement) {
  return text.substring(textarea.selectionStart, textarea.selectionEnd);
}

function addBlockTags(blockTag: any, selected: any) {
  return `${blockTag}\n${selected}\n${blockTag}`;
}

function lineBefore(text: string, textarea: HTMLTextAreaElement) {
  var split: any[] | string[];
  split = text
    .substring(0, textarea.selectionStart)
    .trim()
    .split('\n');
  return split[split.length - 1];
}

function lineAfter(text: string, textarea: HTMLTextAreaElement) {
  return text
    .substring(textarea.selectionEnd)
    .trim()
    .split('\n')[0];
}


function blockTagText(text: string, textArea: HTMLTextAreaElement, blockTag: string, selected: string) {
  const shouldRemoveBlock =
    lineBefore(text, textArea) === blockTag && lineAfter(text, textArea) === blockTag;

  if (shouldRemoveBlock) {
    // To remove the block tag we have to select the line before & after
    if (blockTag != null) {
      textArea.selectionStart = textArea.selectionStart - (blockTag.length + 1);
      textArea.selectionEnd = textArea.selectionEnd + (blockTag.length + 1);
    }
    return selected;
  }
  return addBlockTags(blockTag, selected);
}


export const insertText = (target, text) => {
  // Firefox doesn't support `document.execCommand('insertText', false, text)` on textareas
  const { selectionStart, selectionEnd, value } = target;

  const textBefore = value.substring(0, selectionStart);
  const textAfter = value.substring(selectionEnd, value.length);

  const insertedText = text instanceof Function ? text(textBefore, textAfter) : text;
  const newText = textBefore + insertedText + textAfter;

  target.value = newText;

  target.selectionStart = selectionStart + insertedText.length;

  target.selectionEnd = selectionStart + insertedText.length;

  // Trigger autosave
  target.dispatchEvent(new Event('input'));

  // Trigger autosize
  const event = document.createEvent('Event');
  event.initEvent('autosize:update', true, false);
  target.dispatchEvent(event);
};


function moveCursor({
  textArea,
  tag,
  cursorOffset,
  positionBetweenTags,
  removedLastNewLine,
  select,
}) {
  var pos;
  if (textArea && !textArea.setSelectionRange) {
    return;
  }
  if (select && select.length > 0) {
    if (textArea) {
      // calculate the part of the text to be selected
      const startPosition = textArea.selectionStart - (tag.length - tag.indexOf(select));
      const endPosition = startPosition + select.length;
      return textArea.setSelectionRange(startPosition, endPosition);
    }
  }
  if (textArea) {
    if (textArea.selectionStart === textArea.selectionEnd) {
      if (positionBetweenTags) {
        pos = textArea.selectionStart - tag.length;
      } else {
        pos = textArea.selectionStart;
      }

      if (removedLastNewLine) {
        pos -= 1;
      }

      if (cursorOffset) {
        pos -= cursorOffset;
      }

      return textArea.setSelectionRange(pos, pos);
    }
  }
}

function insertMarkdownText({
  textArea,
  text,
  tag,
  cursorOffset,
  blockTag,
  selected = '',
  wrap,
  select,
}) {
  var textToInsert: string,
    selectedSplit: string[],
    startChar: string,
    removedLastNewLine: boolean,
    removedFirstNewLine: boolean,
    currentLineEmpty: boolean,
    lastNewLine: any,
    editorSelectionStart: { row: number; column: number; },
    editorSelectionEnd: { row: number; };
  removedLastNewLine = false;
  removedFirstNewLine = false;
  currentLineEmpty = false;

  // check for link pattern and selected text is an URL
  // if so fill in the url part instead of the text part of the pattern.
  if (tag === LINK_TAG_PATTERN) {
    if (URL) {
      try {
        const ignoredUrl = new URL(selected);
        // valid url
        tag = '[text]({text})';
        select = 'text';
      } catch (e) {
        // ignore - no valid url
      }
    }
  }

  // Remove the first newline
  if (selected.indexOf('\n') === 0) {
    removedFirstNewLine = true;
    selected = selected.replace(/\n+/, '');
  }

  // Remove the last newline
  if (textArea) {
    if (textArea.selectionEnd - textArea.selectionStart > selected.replace(/\n$/, '').length) {
      removedLastNewLine = true;
      selected = selected.replace(/\n$/, '');
    }
  }

  selectedSplit = selected.split('\n');

  if (textArea && !wrap) {
    lastNewLine = textArea.value.substr(0, textArea.selectionStart).lastIndexOf('\n');

    // Check whether the current line is empty or consists only of spaces(=handle as empty)
    if (/^\s*$/.test(textArea.value.substring(lastNewLine, textArea.selectionStart))) {
      currentLineEmpty = true;
    }
  }

  const isBeginning =
    textArea && textArea.selectionStart === 0;

  startChar = !wrap && !currentLineEmpty && !isBeginning ? '\n' : '';

  const textPlaceholder = '{text}';

  if (selectedSplit.length > 1 && (!wrap || (blockTag != null && blockTag !== ''))) {
    if (blockTag != null && blockTag !== '') {
      textToInsert = blockTagText(text, textArea, blockTag, selected);
    } else {
      textToInsert = selectedSplit
        .map(function (val) {
          if (tag.indexOf(textPlaceholder) > -1) {
            return tag.replace(textPlaceholder, val);
          }
          if (val.indexOf(tag) === 0) {
            return String(val.replace(tag, ''));
          } else {
            return String(tag) + val;
          }
        })
        .join('\n');
    }
  } else if (tag.indexOf(textPlaceholder) > -1) {
    textToInsert = tag.replace(textPlaceholder, selected);
  } else {
    textToInsert = String(startChar) + tag + selected + (wrap ? tag : ' ');
  }

  if (removedFirstNewLine) {
    textToInsert = '\n' + textToInsert;
  }

  if (removedLastNewLine) {
    textToInsert += '\n';
  }

  insertText(textArea, textToInsert);

  return moveCursor({
    textArea,
    tag: tag.replace(textPlaceholder, selected),
    cursorOffset,
    positionBetweenTags: wrap && selected.length === 0,
    removedLastNewLine,
    select
  });
}


function updateText({ textArea, tag, cursorOffset, blockTag, wrap, select, tagContent }: { [key: string]: any }) {
  var selected: any, text: any;
  text = textArea.value;
  selected = selectedText(text, textArea) || tagContent;
  textArea.focus();
  return insertMarkdownText({
    textArea,
    text,
    tag,
    cursorOffset,
    blockTag,
    selected,
    wrap,
    select,
  });
}

@Injectable()
export class MarkdownTagService {

  updateText = updateText;

}