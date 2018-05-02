#!/usr/bin/env python
# -*- coding: utf-8 -*-
import scrapy

#usage: $> scrapy crawl chatbottleSpider

class ChatbottlespiderSpider(scrapy.Spider):
    name = 'chatbottleSpider'
    #allowed_domains = ['chatbottleSpider.com']
    start_urls = ['https://chatbottle.co/bots?page=1']

    def parse(self, response):
        print "hi"
        botBoxSelector = 'div.bot-cart'
        contador = 0;
        for botBox in response.css(botBoxSelector):
            if(contador==0):
                contador+=1 #No analizamos el primero (publicidad)
            continue

            urlSelector = 'bot-cart__info-name::attr(href)'
            href = botBox.css(urlSelector).extract_first()

            data = {
                'url': href, 
            }

            print data
            #yield scrapy.Request(response.urljoin(href),
            #                    callback=self.parse_bot, meta={'data': data})
        '''
        NEXT_PAGE_SELECTOR = 'a.btn:nth-child(12)' #Otra opción es por nro página, hay 500.
        next_page = response.css(NEXT_PAGE_SELECTOR).extract_first()
        if next_page:
            yield scrapy.Request(
                response.urljoin(next_page),
                callback=self.parse
            )
        '''

    def parse_bot(self, response):
        
        data = response.meta.get('data')

        LIKES_SELECTOR = 'div.social__group-item:nth-child(2) > div:nth-child(1) > span:nth-child(2) > span:nth-child(1)'
        likes = data.css(LIKES_SELECTOR).extract_first()
        multiplier = likes[-1]
        if(multiplier == 'm'):
            multiplier = 1000000
            likes = likes[:-1]
        elif (multiplier == 'k'):
            multiplier = 1000
            likes = likes[:-1]
        else:
            multiplier = 1
        likes = likes*multiplier
        yield {
            'url': data['url'],
            'likes': re.search('([\d,]+)',   re.sub(r'<[^>]*?>', ' ', likes )).group(1) ,
        }

    scrapy.Request(url=start_urls[0],callback=parse);


'''
return new Promise(function(resolve,reject){
	    (async ()=>{

	    	//Primera página, procesamos los 3 primeros bots (el 1ro es publicidad, no lo procesamos).
	        await page.goto("https://chatbottle.co/bots/messenger?page=1");
	        var container = await page.$("body > main > article > div > div:nth-child(5)"); //todos los contenedores de bots.
	        var containers = await container.$$("div[class='col-xs-12 bot-cart']");
	        for(var i=1;i<containers.length;i++){ 
				var linkUnprocessed = await containers[i].$("a[href]");
				var linkProcessed = await page.evaluate(
					(linkUnprocessed) => {return Promise.resolve(linkUnprocessed.outerHTML.split('href=')[1].split(' ')[0]);},
					linkUnprocessed
				);
				await parseBotInfo(linkProcessed,browser);
	        }
	        //Resto de páginas. los 3 primeros bots se repiten en todas ellas. (no los procesamos).
	        /*
	        for(var i=2;i<501;i++){
		        await page.goto("https://chatbottle.co/bots/messenger?page=1");
		        var container = await page.$("body > main > article > div > div:nth-child(5)"); //todos los contenedores de bots.
		        var containers = await container.$$("div[class='col-xs-12 bot-cart']");
		        for(var i=0;i<containers.length;i++){ //el primer bot no es un bot, es publicidad.
		        	if(i<3){continue;} 
					var linkUnprocessed = await containers[i].$("a[href]");
					var linkProcessed = await page.evaluate(
						(linkUnprocessed) => {return Promise.resolve(linkUnprocessed.outerHTML.split('href=')[1].split(' ')[0]);},
						linkUnprocessed
					);
					await parseBotInfo(linkProcessed,browser);
		        }
		    }*/
	        resolve();
	    })();
  	});
'''