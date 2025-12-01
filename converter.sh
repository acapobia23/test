#!/bin/bash

if ! command -v convert &> /dev/null; then
    echo -e "\033[31merrore: ImageMagick non è installato.\033[0m"
    echo -e "installa ImageMagick con: sudo apt-get install imagemagick"
    exit 1
fi

output_dir="converted_icons"
mkdir -p "$output_dir"

count=0
skipped=0

for file in *.png; do
    if [ ! -f "$file" ]; then
        continue
    fi
    
    if [ "$file" = "whatsapp.png" ]; then
        echo "saltato: $file (escluso dalla conversione)"
        ((skipped++))
        continue 
    fi
    
    convert "$file" \
        \( +clone -fill white -colorize 100% \) \
        \( -clone 0 -alpha extract \) \
        -delete 0 -alpha off -compose copy_opacity -composite \
        "$output_dir/$file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "$file → $output_dir/$file"
        ((count++))
    else
        echo -e "\033[31merrore nella conversione di: $file\033[0m"
    fi
done


echo -e "\nimmagini convertite: $count"
echo "immagini saltate: $skipped"

if [ $count -eq 0 ]; then
    echo -e "\033[33mnessuna png trovata da convertire nella cartella corrente.\033[0m"
else
    echo "sono state completate tutte le conversioni."
fi