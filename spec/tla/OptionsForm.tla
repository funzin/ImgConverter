---- MODULE OptionsForm ----
\* Options page in src/js/options.ts.
\*
\* The form's width and height move together here. "empty" is both fields blank,
\* "set" is a canonical size in either field, and "bad" is a value decideSave
\* rejects. Which field is bad does not change the steps. canonicalSize shows a
\* stored "bad" as empty. spec/js/options.test.js covers the two fields apart.
\*
\* loadStorage issues chrome.storage.sync.get. The callback runs later and calls
\* setText only when the draft flag is clear and no successful save has bumped
\* formEpoch since that get. An input event sets the draft flag. saveSize returns
\* without storage.set when a load is in flight and the user has not typed.
\* showStatus("Saved", 2000) clears that message later. Typing does not.

EXTENDS Integers

Sizes == {"empty", "set", "bad"}
Statuses == {"blank", "saved", "rejected"}

VARIABLES
  open, loading, draft, status,
  field, stored, snap, typed,
  hydrated, loadStale, committed

vars == <<open, loading, draft, status, field, stored, snap, typed,
          hydrated, loadStale, committed>>

Canon(s) == IF s = "bad" THEN "empty" ELSE s

TypeOK ==
  /\ open \in BOOLEAN
  /\ loading \in BOOLEAN
  /\ draft \in BOOLEAN
  /\ status \in Statuses
  /\ field \in Sizes /\ stored \in Sizes /\ snap \in Sizes /\ typed \in Sizes
  /\ hydrated \in BOOLEAN
  /\ loadStale \in BOOLEAN
  /\ committed \in BOOLEAN

Init ==
  /\ open = FALSE
  /\ loading = FALSE
  /\ draft = FALSE
  /\ status = "blank"
  /\ field = "empty"
  /\ stored \in Sizes
  /\ snap = "empty"
  /\ typed = "empty"
  /\ hydrated = FALSE
  /\ loadStale = FALSE
  /\ committed = FALSE

OpenOptions ==
  /\ ~open
  /\ open' = TRUE
  /\ loading' = TRUE
  /\ loadStale' = FALSE
  /\ snap' = stored
  /\ UNCHANGED <<draft, status, field, stored, typed, hydrated, committed>>

LoadReturns ==
  /\ loading
  /\ loading' = FALSE
  /\ IF draft \/ loadStale
     THEN /\ field' = field
          /\ hydrated' = hydrated
     ELSE /\ field' = Canon(snap)
          /\ hydrated' = TRUE
  /\ UNCHANGED <<open, draft, status, stored, snap, typed, loadStale, committed>>

EditFields(s) ==
  /\ open
  /\ s \in Sizes
  /\ s # field
  /\ field' = s
  /\ typed' = s
  /\ draft' = TRUE
  /\ UNCHANGED <<open, loading, status, stored, snap, hydrated, loadStale, committed>>

SaveSize ==
  /\ open
  /\ draft \/ ~loading
  /\ field \in {"empty", "set"}
  /\ stored' = field
  /\ draft' = FALSE
  /\ status' = "saved"
  /\ loadStale' = TRUE
  /\ committed' = TRUE
  /\ hydrated' = TRUE
  /\ UNCHANGED <<open, loading, field, snap, typed>>

RejectSize ==
  /\ open
  /\ draft
  /\ field = "bad"
  /\ status' = "rejected"
  /\ UNCHANGED <<open, loading, draft, field, stored, snap, typed, hydrated, loadStale, committed>>

\* Save while the blank form is still loading does not reach storage.set.
\* The screen does not change, so this step is a stutter.
SaveWhileLoading ==
  /\ open /\ loading /\ ~draft
  /\ UNCHANGED vars

FadeSaved ==
  /\ status = "saved"
  /\ status' = "blank"
  /\ UNCHANGED <<open, loading, draft, field, stored, snap, typed, hydrated, loadStale, committed>>

Next ==
  \/ OpenOptions
  \/ LoadReturns
  \/ SaveSize
  \/ RejectSize
  \/ SaveWhileLoading
  \/ FadeSaved
  \/ \E s \in Sizes : EditFields(s)

Spec == Init /\ [][Next]_vars

\* After Save, the fields keep the saved value until the user types again.
ShownSave ==
  status = "saved" /\ ~draft => field = stored

\* The load's setText does not replace a field the user has edited.
DraftHeld ==
  draft => field = typed

\* storage.set runs only from a successful Save. Until then, the stored value
\* is the snapshot taken when the page opened.
StorageChangesOnlyFromASave ==
  open => stored = snap \/ committed

SavedSizesAreCanonical ==
  committed => stored \in {"empty", "set"}

SavedMeansCommitted ==
  status = "saved" => committed

RejectionKeepsTheDraft ==
  status = "rejected" => draft /\ field = typed

SettledFormMatchesStorage ==
  open /\ ~loading /\ ~draft /\ hydrated /\ status \in {"blank", "saved"} =>
    field = Canon(stored)

\* Clicking Save while the form is still the unloaded blank page is not a request
\* to store empty. saveSize returns before storage.set in that case.
SaveWaitsForTheLoad ==
  [][SaveSize => (draft \/ ~loading)]_vars

====
