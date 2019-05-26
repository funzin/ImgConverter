#!/bin/bash

for size in 16 48 128
do
  convert icons/source.png -resize ${size}x  -unsharp 1.5x1+0.7+0.02 icons/${size}.png
done
