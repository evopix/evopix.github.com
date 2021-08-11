var fs = require('fs');
var _ = require('lodash');
var Mustache = require('mustache');
var schema = require('resume-schema');

var d = new Date();
var curyear = d.getFullYear();

var resumeObject = schema.resumeJson; 

var d = new Date();
var curyear = d.getFullYear();

function getMonth(dateStr) {
    switch (dateStr.substr(5,2)) {
    case '01':
        return "Jan.";
    case '02':
        return "Feb.";
    case '03':
        return "Mar.";
    case '04':
        return "Apr.";
    case '05':
        return "May";
    case '06':
        return "June";
    case '07':
        return "July";
    case '08':
        return "Aug.";
    case '09':
        return "Sept.";
    case '10':
        return "Oct.";
    case '11':
        return "Nov.";
    case '12':
        return "Dec.";
    }
}

function render(resumeObject) {

resumeObject.basics.capitalName = (resumeObject.basics.name).toUpperCase();
resumeObject.basics.capitalLabel = (resumeObject.basics.label).toUpperCase();

    if (resumeObject.basics.email) {
        resumeObject.emailBool = true;
    }

    if (resumeObject.basics.phone) {
        resumeObject.phoneBool = true;
    }

    if (resumeObject.basics.picture) {
        resumeObject.pictureBool = true;
    }

    if (resumeObject.basics.url) {
        resumeObject.websiteBool = true;
        resumeObject.basics.urlText = resumeObject.basics.url.replace(/(^\w+:|^)\/\//, '');
    }

    if (resumeObject.basics.summary) {
        resumeObject.aboutBool = true;
    }

    if (resumeObject.basics.profiles) {
        _.each(resumeObject.basics.profiles, function(p){
            switch(p.network.toLowerCase()) {
                // special cases
                case "stack-overflow":
                case "stackoverflow":
                    p.iconClass = "fab fa-stack-overflow";
                    break;
                case "blog":
                case "rss":
                    p.iconClass = "fas fa-rss-square";
                    break;
                case "linkedin":
                    p.iconClass = "fab fa-linkedin"
                    if (p.url == '' && p.username != '') {
                        p.url = "https://linkedin.com/in/" + p.username;
                    }
                case "facebook":
                    p.iconClass = "fab fa-facebook"
                    if (p.url == '' && p.username != '') {
                        p.url = "https://facebook.com/" + p.username;
                    }
                case "twitter":
                    p.iconClass = "fab fa-twitter"
                    if (p.url == '' && p.username != '') {
                        p.url = "https://twitter.com/" + p.username;
                    }
                default:
                    // try to automatically select the icon based on the name
                    p.iconClass = "fab fa-" + p.network.toLowerCase();
            }

            if (p.url) {
                p.text = p.url.replace(/(^\w+:|^)\/\//, '');
            } else {
                p.text = p.network + ": " + p.username;
            }
        });
    }

    if (resumeObject.work) {
        if (resumeObject.work[0].name) {
            resumeObject.workBool = true;
            _.each(resumeObject.work, function(w){
                if (w.startDate) {
                    w.startDateYear = (w.startDate || "").substr(0,4);
                    w.startDateMonth = getMonth(w.startDate || "");
                }
                if(w.endDate) {
                    w.endDateYear = (w.endDate || "").substr(0,4);
                    w.endDateMonth = getMonth(w.endDate || "");
                } else { 
                    w.endDateYear = 'Present'
                }
                if (w.highlights) {
                    if (w.highlights[0]) {
                        if (w.highlights[0] != "") {
                            w.workHighlights = true;
                        }
                    }
                }
            });
        }
    }

    if (resumeObject.education) {
        if (resumeObject.education[0].institution) {
            resumeObject.educationBool = true;
            _.each(resumeObject.education, function(e){
                if( !e.area || !e.studyType ){
                  e.educationDetail = (e.area == null ? '' : e.area) + (e.studyType == null ? '' : e.studyType);
                } else {
                  e.educationDetail = e.area + ", "+ e.studyType;
                }
                if (e.gpa) {
                    e.gpaBool = true;
                }
                if (e.startDate) {
                    e.startDateYear = e.startDate.substr(0,4);
                    e.startDateMonth = getMonth(e.startDate || "");
                } else {
                    e.endDateMonth = "";
                }
                if (e.endDate) {
                    e.endDateYear = e.endDate.substr(0,4);
                    e.endDateMonth = getMonth(e.endDate || "");
                    if (e.endDateYear > curyear) {
                        e.endDateYear += " (expected)";
                    }
                } else { 
                    e.endDateYear = 'Present'
                    e.endDateMonth = '';
                }
                if (e.courses) {
                    if (e.courses[0]) {
                        if (e.courses[0] != "") {
                            e.educationCourses = true;
                        }
                    }
                }
            });
        }
    }

    if (resumeObject.awards) {
        if (resumeObject.awards[0].title) {
            resumeObject.awardsBool = true;
            _.each(resumeObject.awards, function(a){
                a.year = (a.date || "").substr(0,4);
                a.day = (a.date || "").substr(8,2);
                a.month = getMonth(a.date || "");
            });
        }
    }

    if (resumeObject.publications) {
        if (resumeObject.publications[0].name) {
            resumeObject.publicationsBool = true;
            _.each(resumeObject.publications, function(a){
                a.year = (a.releaseDate || "").substr(0,4);
                a.day = (a.releaseDate || "").substr(8,2);
                a.month = getMonth(a.releaseDate || "");
            });
        }
    }

    if (resumeObject.volunteer) {
        if (resumeObject.volunteer[0].position) {
            resumeObject.volunteerBool = true;
            _.each(resumeObject.volunteer, function(a){
                a.startDateYear = (a.startDate || "").substr(0,4);
                a.startDateMonth = getMonth(a.startDate || "");
                a.endDateYear = (a.endDate || "").substr(0,4);
                a.endDateMonth = getMonth(a.endDate || "");
                if (a.highlights) {
                    if (a.highlights[0]) {
                        if (a.highlights[0] != "") {
                            a.volunterHighlights = true;
                        }
                    }
                }
            });
        }
    }

    if (resumeObject.skills) {
        if (resumeObject.skills[0].name) {
            resumeObject.skillsBool = true;
        }
    }

    if (resumeObject.interests) {
        if (resumeObject.interests[0].name) {
            resumeObject.interestsBool = true;
        }
    }

    if (resumeObject.languages) {
        if (resumeObject.languages[0].language) {
            resumeObject.languagesBool = true;
        }
    }

    if (resumeObject.references) {
        if (resumeObject.references[0].name) {
            resumeObject.referencesBool = true;
        }
    }

    resumeObject.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    resumeObject.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
    var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
    var resumeHTML = Mustache.render(theme, resumeObject);
    

    return resumeHTML;
};
module.exports = {
    render: render
}