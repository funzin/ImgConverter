---- MODULE SecondClick ----
\* convert-to-img-tag.js can be injected again before the first storage callback
\* runs. Callbacks run one at a time, on the JavaScript thread, in the order the
\* gets were issued. The first callback that finds a picture replaces it. The
\* next callback reads the replaced value, finds no picture, and does not write.
\* spec/browser/reinjection.spec.js checks that a second injection does not throw.

EXTENDS Integers

VARIABLES queued, field, writes
vars == <<queued, field, writes>>

TypeOK ==
  /\ queued \in 0..2
  /\ field \in {"picture", "converted"}
  /\ writes \in 0..2

Init ==
  /\ queued = 0
  /\ field = "picture"
  /\ writes = 0

Click ==
  /\ queued < 2
  /\ queued' = queued + 1
  /\ UNCHANGED <<field, writes>>

Deliver ==
  /\ queued > 0
  /\ queued' = queued - 1
  /\ IF field = "picture"
     THEN /\ field' = "converted"
          /\ writes' = writes + 1
     ELSE /\ UNCHANGED <<field, writes>>

Next ==
  \/ Click
  \/ Deliver

Spec == Init /\ [][Next]_vars

\* The first callback converts the picture. A later callback does not write again.
SingleConversion ==
  writes <= 1

====
