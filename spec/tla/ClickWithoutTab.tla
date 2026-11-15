---- MODULE ClickWithoutTab ----
\* src/js/background.ts returns when tab.id is undefined. It calls
\* chrome.scripting.executeScript only when the tab has an id. The promise is
\* not awaited. A failed injection is not a state here.

EXTENDS Integers

VARIABLES tab, script, armed
vars == <<tab, script, armed>>

Scripts == {"waiting", "injected", "ignored"}

TypeOK ==
  /\ tab \in BOOLEAN
  /\ script \in Scripts
  /\ armed \in BOOLEAN

Init ==
  /\ tab \in BOOLEAN
  /\ script = "waiting"
  /\ armed = FALSE

HideTab ==
  /\ tab
  /\ tab' = FALSE
  /\ UNCHANGED <<script, armed>>

ShowTab ==
  /\ ~tab
  /\ tab' = TRUE
  /\ UNCHANGED <<script, armed>>

Click ==
  /\ IF tab
     THEN /\ script # "injected"
          /\ script' = "injected"
          /\ armed' = TRUE
     ELSE /\ script = "waiting"
          /\ script' = "ignored"
          /\ UNCHANGED armed
  /\ UNCHANGED tab

Next ==
  \/ HideTab
  \/ ShowTab
  \/ Click

Spec == Init /\ [][Next]_vars

\* executeScript runs only for a click that saw a tab id. Hiding the tab later
\* does not undo an injection that already happened.
InjectedOnlyWithATab ==
  script = "injected" => armed

====
