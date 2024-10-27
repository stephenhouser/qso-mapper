#!/bin/bash

if [[ ! -z "$ADIF_URL" ]]; then
    cp index.html index.html.bak && \
    sed -e "s,let ADIF_URL = '';,let ADIF_URL = '$ADIF_URL';," \
        index.html > index.html.tmp && \
        mv index.html.tmp index.html
fi

if [[ ! -z "$TITLE" ]]; then
    cp index.html index.html.bak && \
    sed -e "s,<title>QSO/ADIF Mapper<\/title>,<title>$TITLE<\/title>," \
        index.html > index.html.tmp && \
        mv index.html.tmp index.html
fi

if [[ ! -z "$BRAND" ]]; then
    cp index.html index.html.bak && \
    sed -e "s,QSO Mapper,$BRAND," \
        index.html > index.html.tmp && \
    mv index.html.tmp index.html
fi