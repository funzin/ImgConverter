---- MODULE SizeFreeze ----
\* The size half of one toolbar click. src/js/convert-to-img-tag.ts reads the
\* object passed to the chrome.storage.sync.get callback. That object is the
\* value from when the browser finished the get (BrowserFinishesRead copies
\* stored into seen). ApplyConversion uses seen, not the live stored value.
\* ChangeStoredSize is a successful options save. "default" is an empty pair,
\* which createParams turns into width 50%. "width" stands for any other
\* canonical pair. Height alone and both sides take the same steps.

EXTENDS Integers

Sizes == {"default", "width"}
Phases == {"idle", "reading", "ready"}

VARIABLES phase, stored, seen, holding, note, applied
vars == <<phase, stored, seen, holding, note, applied>>

TypeOK ==
  /\ phase \in Phases
  /\ stored \in Sizes
  /\ seen \in Sizes
  /\ holding \in BOOLEAN
  /\ note \in {"none", "skipped"}
  /\ applied \in Sizes \cup {"none"}

Init ==
  /\ phase = "idle"
  /\ stored = "default"
  /\ seen = "default"
  /\ holding = FALSE
  /\ note = "none"
  /\ applied = "none"

ClickIcon ==
  /\ phase = "idle"
  /\ phase' = "reading"
  /\ note' = "none"
  /\ UNCHANGED <<stored, seen, holding, applied>>

BrowserFinishesRead ==
  /\ phase = "reading"
  /\ phase' = "ready"
  /\ seen' = stored
  /\ UNCHANGED <<stored, holding, note, applied>>

ApplyConversion ==
  /\ phase = "ready"
  /\ phase' = "idle"
  /\ IF ~holding
     THEN /\ holding' = TRUE
          /\ note' = "none"
          /\ applied' = seen
     ELSE /\ note' = "skipped"
          /\ UNCHANGED <<holding, applied>>
  /\ UNCHANGED <<stored, seen>>

EditBack ==
  /\ holding
  /\ phase = "idle"
  /\ holding' = FALSE
  /\ note' = "none"
  /\ UNCHANGED <<phase, stored, seen, applied>>

ChangeStoredSize ==
  /\ stored' = IF stored = "default" THEN "width" ELSE "default"
  /\ UNCHANGED <<phase, seen, holding, note, applied>>

Next ==
  \/ ClickIcon
  \/ BrowserFinishesRead
  \/ ApplyConversion
  \/ EditBack
  \/ ChangeStoredSize

Spec == Init /\ [][Next]_vars

\* While the converted tag is what the field shows, its size is the size frozen
\* for that read. A save that arrives after the freeze changes stored and leaves
\* applied alone. A callback that used the live stored value would fail this.
FrozenSize ==
  holding /\ phase = "idle" /\ note = "none" => applied = seen

====
