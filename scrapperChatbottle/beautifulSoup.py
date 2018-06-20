#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 
# For python 2.7, usage: python beautifulSoup.py
# Simple script, no classes. If html or classes are changed in the page this breaks as a glass.

from bs4 import BeautifulSoup #pip install BeautifulSoup4
import urllib2 #pip install urllib2
import MySQLdb #sudo apt-get install python-mysqldb


db = MySQLdb.connect(host="localhost",    
                     user="root",         
                     passwd="root",  
                     db="messengerbots")  
cur = db.cursor()

def parse_bot(link):
   
    page2 = urllib2.urlopen(link).read()
    soup2 = BeautifulSoup(page2, 'html.parser')
    
    #likesSelector = 'div.social__group-item:nth-child(2) > div:nth-child(1) > span:nth-child(2) > span:nth-child(1)'
    #nth-child not implemented.
    #likesSelector = 'div.social__group-item:nth-of-type(2) > div:nth-of-type(1) > span:nth-of-type(2) > span:nth-of-type(1)' 
    
    #socialSelector = "div[class='row social__group']"
    #socialBar = soup2.select(socialSelector);
    #likesSelector = "span[title='Facebook likes']"
    
    #socialSelector = "span[class='social__item-text']"
    #social = soup2.select(socialSelector)
    
    socialContainer = soup2.findAll("span",{"class":"social__item-text"});
    #likes = socialBar.select(likesSelector)
    likesRaw = socialContainer[1] 
    likes = likesRaw.text
    likes =likes.replace("\n","").replace("\r","").replace(" ","").replace("\f","").replace("\t","").replace(",","");
   
    if(likes != 'N/A'):
        multiplier = likes[-1]
        if(multiplier == 'm'):
            multiplier = 1000000
            likes = likes[:-1]
        elif (multiplier == 'k'):
            multiplier = 1000
            likes = likes[:-1]   
        else:
            multiplier = 1
        likes = int(float(likes)*multiplier)
    else:
        likes = "NULL"
    
    cur.execute("INSERT INTO chatbottle(link,likes)VALUES(\"" + link+"\","+ str(likes)+");")
  
    print link+", likes: " +str(likes) #visual feedback while script running.

    #yield {
    #    'url': data['url'],
    #    'likes': re.search('([\d,]+)',   re.sub(r'<[^>]*?>', ' ', likes )).group(1) ,
    #}

def parse(soup):
    urlSelector = 'a[class="bot-cart__info-name"]'
    hrefList= soup.select(urlSelector)
    #hrefList= soup.findAll("a",{"class":"bot-cart__info-name"})#['href'] #??
    for i in range(0,len(hrefList)): #selector bs4 element.Tag
        if(i < 3): #ignoramos las 3 primeras entradas (se repiten en todas las páginas y la primera es publi)
            continue
        hrefRaw = hrefList[i]
        hrefRaw = str(hrefRaw); #lo transformamos en string para trabajar de manera cómoda.
        href = hrefRaw.split('href="')[1].split('"')[0]
        data = {
            'url': href
        }
       
        parse_bot(href)
    db.commit()

def iterateOverAllPages(): 
    #En la primera página podríamos recoger también los bots segundo y tercero. (primero es publi).
    for pageNumber in range(1,501):
        page = urllib2.urlopen('https://chatbottle.co/bots?page='+str(pageNumber)).read()
        soup = BeautifulSoup(page, 'html.parser')
        parse(soup)
        print pageNumber



iterateOverAllPages()

db.close()

#tras generar tabla, copia seguridad: 
#
#mysqldump -u root -p -h localhost messengerbots chatbottle > chatbottleBackUp.sql 
#
#para ver los 200 mejores bots por likes: select * from chatbottle order by likes desc limit 200;

