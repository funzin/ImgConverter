---- MODULE ToolbarClick ----
\* One toolbar click, from src/js/background.ts and src/js/convert-to-img-tag.ts.
\*
\* The script remembers document.activeElement (target), then waits for
\* chrome.storage.sync.get. The callback reads that element's value and selection
\* together. A caret converts the whole value. A range converts the selection.
\* insertText runs only when the value contains a markdown image or a GitHub
\* upload tag. Moving focus while the read is in flight does not retarget it.
\* The saved size is SizeFreeze.tla. A missing tab id is ClickWithoutTab.tla.
\* A second click that overlaps this read is SecondClick.tla.

EXTENDS Integers

Texts == {"plain", "markdown", "upload"}
Fields == Texts \cup {"whole", "selection"}
Foci == {"field", "away"}
Sels == {"caret", "range"}
Phases == {"idle", "reading", "ready"}
Notes == {"none", "skipped", "no-tab"}

VARIABLES field, focus, selection, phase, target, note
vars == <<field, focus, selection, phase, target, note>>

TypeOK ==
  /\ field \in Fields
  /\ focus \in Foci
  /\ selection \in Sels
  /\ phase \in Phases
  /\ target \in Foci
  /\ note \in Notes

Init ==
  /\ field = "markdown"
  /\ focus = "field"
  /\ selection = "caret"
  /\ phase = "idle"
  /\ target = "field"
  /\ note = "none"

ClickIcon ==
  /\ phase = "idle"
  /\ phase' = "reading"
  /\ target' = focus
  /\ note' = "none"
  /\ UNCHANGED <<field, focus, selection>>

BrowserFinishesRead ==
  /\ phase = "reading"
  /\ phase' = "ready"
  /\ UNCHANGED <<field, focus, selection, target, note>>

ApplyConversion ==
  /\ phase = "ready"
  /\ phase' = "idle"
  /\ LET picture == field \in {"markdown", "upload"}
         mode == IF selection = "range" THEN "selection" ELSE "whole"
     IN IF target = "field" /\ picture
        THEN /\ field' = mode
             /\ note' = "none"
        ELSE /\ note' = "skipped"
             /\ UNCHANGED field
  /\ UNCHANGED <<focus, selection, target>>

EditText(text) ==
  /\ text \in Texts
  /\ text # field
  /\ field' = text
  /\ note' = "none"
  /\ UNCHANGED <<focus, selection, phase, target>>

MoveFocus ==
  /\ focus' = IF focus = "field" THEN "away" ELSE "field"
  /\ UNCHANGED <<field, selection, phase, target, note>>

MoveSelection ==
  /\ selection' = IF selection = "caret" THEN "range" ELSE "caret"
  /\ UNCHANGED <<field, focus, phase, target, note>>

Next ==
  \/ ClickIcon
  \/ BrowserFinishesRead
  \/ ApplyConversion
  \/ MoveFocus
  \/ MoveSelection
  \/ \E text \in Texts : EditText(text)

Spec == Init /\ [][Next]_vars

\* The callback must not skip a picture on the element captured at the click,
\* even if focus has since moved away. Skipping that picture is what the old
\* code did, because it read document.activeElement inside the callback.
NeverSkipTheCapturedPicture ==
  ~(note = "skipped" /\ target = "field" /\ field \in {"markdown", "upload"})

\* A range and a caret are different results. ApplyConversion is the only action
\* that produces them, and it reads selection in the same step as the value.
====
