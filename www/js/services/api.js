/**
 * API service for the Democracy.io app.
 */

var api = function ($http, dioConfig) {

  return {

    /**
     *
     * @param lat
     * @param lng
     */
    getRepsByLocation: function(lat, lng) {

        return [
          {
            "bioguide_id": "P000197",
            "birthday": "1940-03-26",
            "chamber": "house",
            "contact_form": "http://pelosi.house.gov/contact-me/email-me",
            "crp_id": "N00007360",
            "district": 12,
            "facebook_id": "86574174383",
            "fax": "202-225-8259",
            "fec_ids": [
              "H8CA05035"
            ],
            "first_name": "Nancy",
            "gender": "F",
            "govtrack_id": "400314",
            "icpsr_id": 15448,
            "in_office": true,
            "last_name": "Pelosi",
            "leadership_role": "Minority Leader",
            "middle_name": null,
            "name_suffix": null,
            "nickname": null,
            "oc_email": "Rep.Pelosi@opencongress.org",
            "ocd_id": "ocd-division/country:us/state:ca/cd:12",
            "office": "233 Cannon House Office Building",
            "party": "D",
            "phone": "202-225-4965",
            "state": "CA",
            "state_name": "California",
            "term_end": "2017-01-03",
            "term_start": "2015-01-06",
            "thomas_id": "00905",
            "title": "Rep",
            "twitter_id": "NancyPelosi",
            "votesmart_id": 26732,
            "website": "http://pelosi.house.gov",
            "youtube_id": "nancypelosi"
          },
          {
            "bioguide_id": "B000711",
            "birthday": "1940-11-11",
            "chamber": "senate",
            "contact_form": "https://www.boxer.senate.gov/contact/shareyourviews.html",
            "crp_id": "N00006692",
            "district": null,
            "facebook_id": "116513005087055",
            "fax": "202-224-0454",
            "fec_ids": [
              "S2CA00286",
              "H2CA06028",
              "P80003247"
            ],
            "first_name": "Barbara",
            "gender": "F",
            "govtrack_id": "300011",
            "icpsr_id": 15011,
            "in_office": true,
            "last_name": "Boxer",
            "middle_name": null,
            "name_suffix": null,
            "nickname": null,
            "oc_email": "Sen.Boxer@opencongress.org",
            "ocd_id": "ocd-division/country:us/state:ca",
            "office": "112 Hart Senate Office Building",
            "party": "D",
            "phone": "202-224-3553",
            "state": "CA",
            "state_name": "California",
            "term_end": "2017-01-03",
            "term_start": "2011-01-05",
            "thomas_id": "00116",
            "title": "Sen",
            "twitter_id": "SenatorBoxer",
            "votesmart_id": 53274,
            "website": "http://www.boxer.senate.gov",
            "youtube_id": "SenatorBoxer",
            "lis_id": "S223",
            "senate_class": 3,
            "state_rank": "junior"
          },
          {
            "bioguide_id": "F000062",
            "birthday": "1933-06-22",
            "chamber": "senate",
            "contact_form": "https://www.feinstein.senate.gov/public/index.cfm/e-mail-me",
            "crp_id": "N00007364",
            "district": null,
            "facebook_id": "334887279867783",
            "fax": "202-228-3954",
            "fec_ids": [
              "S0CA00199"
            ],
            "first_name": "Dianne",
            "gender": "F",
            "govtrack_id": "300043",
            "icpsr_id": 49300,
            "in_office": true,
            "last_name": "Feinstein",
            "middle_name": null,
            "name_suffix": null,
            "nickname": null,
            "oc_email": "Sen.Feinstein@opencongress.org",
            "ocd_id": "ocd-division/country:us/state:ca",
            "office": "331 Hart Senate Office Building",
            "party": "D",
            "phone": "202-224-3841",
            "state": "CA",
            "state_name": "California",
            "term_end": "2019-01-03",
            "term_start": "2013-01-03",
            "thomas_id": "01332",
            "title": "Sen",
            "twitter_id": "SenFeinstein",
            "votesmart_id": 53273,
            "website": "http://www.feinstein.senate.gov",
            "youtube_id": "SenatorFeinstein",
            "lis_id": "S221",
            "senate_class": 1,
            "state_rank": "senior"
          }
        ]
    },

    getRepsById: function(repIds) {

    },

    /**
     *
     */
    submitMessageToReps: function() {

    },

    /**
     *
     */
    submitCaptchaResponse: function() {

    }

  };

};

module.exports = api;
