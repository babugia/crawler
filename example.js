
var Crawler = {
    request: null,
    cheerio: null,
    fs: null,
    fileName: null,
    query: null,
    init: function () {
        Crawler.request = require('request');
        Crawler.cheerio = require('cheerio');
        Crawler.fs = require('fs');
        Crawler.fileName = 'data.csv';
        Crawler.query = 'heart';
        Crawler.getLinks();
    },
    appendFile: function (data) {
        Crawler.fs.appendFile(Crawler.fileName, data, function (err) {
            if (err) {
                console.log('Erro ao gravar dados no arquivo: ' + err);
                throw err;
            }
        });
    },
    getLinks: function () {
        //cabeçalho do arquivo
        //Crawler.appendFile('DOI;TITLE;KEYWORDS;ABREVIATIONS;ABSTRACT;TEXT;\n');

        for (var page = 41; page < 43; page++) {
            //recupera dados de cada página de consulta
            //console.log(page);
            Crawler.request('https://jmedicalcasereports.biomedcentral.com/articles?query=' + Crawler.query + '&searchType=journalSearch&tab=keyword&page=' + page, function (err, res, body) {
                if (err)
                    console.log('Erro ao recuperar dados da página: ' + err);

                var $ = Crawler.cheerio.load(body);

                //recupera links e conteudo dos artigos na página
                $('.c-teaser__title a').each(function () {
                    Crawler.getContent('https://jmedicalcasereports.biomedcentral.com' + $(this).attr('href').trim());
                });
            });
        }
    },
    getContent: function (link) {
        Crawler.request(link, function (err, res, body) {
            if (err)
                console.log('Error: ' + err);

            var $ = Crawler.cheerio.load(body);

            //Article Title + DOI
            var title = $('.ArticleTitle').text().trim();
            var doi = $('.ArticleDOI').text().trim();

            //Keywords
            var keywords = '';
            $('.KeywordGroup.Section1.RenderAsSection1 .Keyword').each(function () {
                if (keywords !== '')
                    keywords += ', ';
                keywords += $(this).text().trim();

            });

            //Abreviations
            var abreviations = '';
            $('.DefinitionListEntry').each(function () {
                if (abreviations !== '')
                    abreviations += ', ';
                abreviations += $(this).find('.Term').text().trim();
                abreviations += ' ' + $(this).find('.Description .Para').text().trim();
            });
            abreviations = abreviations.replace(/\r?\n|\r/g, '');

            //-------------------------------------------------------------------------
            // ABSTRACT
            //-------------------------------------------------------------------------
            //Introduction
            var abstract = 'INTRODUCTION: ';
            $('#ASec1 .Para').each(function () {
                abstract += $(this).text().trim();
            });

            //Case Presentation
            abstract += 'CASE PRESENTATION: ';
            $('#ASec2 .Para').each(function () {
                abstract += $(this).text().trim();
            });

            //Conclusion
            abstract += 'CONCLUSION: ';
            $('#ASec3 .Para').each(function () {
                abstract += $(this).text().trim();
            });

            abstract = abstract.replace(/;/g, ',');
            abstract = abstract.replace(/\r?\n|\r/g, '');
            //-------------------------------------------------------------------------

            //-------------------------------------------------------------------------
            // MAIN CONTENT
            //-------------------------------------------------------------------------
            //Introduction
            var mainContent = 'INTRODUCTION: ';
            $('#Sec1 .Para').each(function () {
                mainContent += $(this).text().trim();
            });

            //Case Presentation
            mainContent += 'CASE PRESENTATION: ';
            $('#Sec2 .Para').each(function () {
                mainContent += $(this).text().trim();
            });

            //Discussion
            mainContent += 'DISCUSSION: ';
            $('#Sec3 .Para').each(function () {
                mainContent += $(this).text().trim();
            });

            //Conclusion
            mainContent += 'CONCLUSION:\n';
            $('#Sec4 .Para').each(function () {
                mainContent += $(this).text().trim();
            });

            mainContent = mainContent.replace(/;/g, ',');
            mainContent = mainContent.replace(/\r?\n|\r/g, '');
            //-------------------------------------------------------------------------

            var data = doi + ';' + title + ';' + keywords + ';' + abreviations + ';' + abstract + ';' + mainContent + ';' + '\n';

            Crawler.appendFile(data);
        });
    }
};
Crawler.init();