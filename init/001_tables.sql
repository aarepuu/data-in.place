BEGIN;

DROP TABLE IF EXISTS "datasets";
DROP TABLE IF EXISTS "boundary";
DROP TABLE IF EXISTS "oa11_postcodes";
DROP TABLE IF EXISTS "challenges";

-- Sequences
CREATE SEQUENCE IF NOT EXISTS challenges_id_seq;

-- ultimate lookup table for UK
CREATE TABLE "oa11_postcodes" (
    "postcode" varchar,
    "positional_quality_indicator" varchar,
    "eastings" varchar,
    "northings" varchar,
    "country_code" varchar,
    "nhs_regional_ha_code" varchar,
    "nhs_ha_code" varchar,
    "admin_county_code" varchar,
    "admin_district_code" varchar,
    "admin_ward_code" varchar,
    "location" geometry,
    "pcd7" varchar,
    "pcd8" varchar,
    "pcds" varchar,
    "dointr" int4,
    "doterm" int4,
    "usertype" int2,
    "oa11cd" varchar,
    "lsoa11cd" varchar,
    "msoa11cd" varchar,
    "ladcd" varchar,
    "lsoa11nm" varchar,
    "msoa11nm" varchar,
    "ladnm" varchar,
    "ladnmw" varchar,
    "fid" int4
);

-- Functional tables
CREATE TABLE "datasets" (
    "id" int4 NOT NULL,
    "title" varchar(255),
    "description" text,
    "date_issued" date,
    "publisher" varchar(255),
    "publisher_link" varchar(255),
    "api_link" varchar(255),
    "table_name" varchar(255),
    "last_update" timestamp DEFAULT now(),
    "levels" varchar(255),
    "license" varchar(100),
    "comment" varchar(255),
    "source" varchar(255),
    "reference" varchar(255),
    "ctype" varchar(255),
    "update_feq" varchar(255),
    "api_docs" varchar(255),
    "api_key" varchar(255),
    "geom" varchar,
    "active" bool,
    "ext" bool
);

CREATE TABLE "challenges" (
    "id" int4 NOT NULL DEFAULT nextval('challenges_id_seq'::regclass),
    "title" varchar,
    "line" varchar,
    "tags" _json,
    "content" text,
    "publish" bool,
    "dataurl" varchar,
    "cid" varchar(37),
    "bbox" geometry,
    "created_at" timestamp DEFAULT now()
);

-- Stats Tables
CREATE TABLE "boundary" (
    "created_at" timestamp DEFAULT now(),
    "geom" geometry,
    "gjson" json,
    "loc" geometry,
    "sessionid" varchar
);


-- indexes
CREATE INDEX oa11_postcodes_postcode
  ON oa11_postcodes
  USING btree(postcode);

CREATE INDEX oa11_postcodes_location
  ON oa11_postcodes
  USING gist(location);

INSERT INTO "datasets" ("id", "title", "description", "date_issued", "publisher", "publisher_link", "api_link", "table_name", "last_update", "levels", "license", "comment", "source", "reference", "ctype", "update_feq", "api_docs", "api_key", "geom", "active", "ext") VALUES
(11, 'Age by single year', 'This dataset provides 2011 estimates that classify usual residents in England and Wales by single year of age', '2011-03-27', 'Office of National Statistics', 'https://www.nomisweb.co.uk/census/2011/qs103ew', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_503_1.data.csv?select=geography_code%2Cc_age_name%2Cobs_value&rural_urban=0&measures=20100&time=latest&geography=', NULL, '2018-02-01 10:50:13.706725', 'lad,msoa,lsoa,oa,rgn,wd', 'OGL', NULL, 'Census 2011', 'QS103EW', NULL, NULL, 'https://www.nomisweb.co.uk/api/v01/help', NULL, 'ons', 't', 't'),
(6, 'Energy Performance', 'Energy Performance of Buildings Data England and Wales', '2014-08-11', 'Department for Communities and Local Government', NULL, 'https://epc.opendatacommunities.org/api/v1/domestic/search', 'dom_epc', '2018-01-11 10:47:10.764217', 'add,pcode,lad,const', 'OGL', NULL, 'DCLG', NULL, NULL, 'realtime', 'https://epc.opendatacommunities.org/docs/api/domestic', 'YS5wdXVzc2FhcjJAbmNsLmFjLnVrOmE0ZjIxMWNlN2Q5MzA3YmVmNTgyNDcwYjRiYjU3NGEwYjhlYzM3ODM=', 'ons', 'f', 't'),
(10, 'Obesity Statistics', 'This statistical report presents information on obesity, physical activity and diet, drawn together from a variety of sources.', '2017-03-30', 'NHS', 'http://digital.nhs.uk/catalogue/PUB23742', '/api/data/obes', 'obes', '2018-01-31 13:38:02.294446', 'lad,rgn', 'OGL', NULL, 'NHS', NULL, NULL, NULL, NULL, NULL, 'ons', 't', 'f'),
(5, 'General health', 'This dataset provides 2011 estimates that classify usual residents in England and Wales by the state of their general health.', '2011-03-27', 'Office of National Statistics', 'https://www.nomisweb.co.uk/census/2011/qs302ew', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_531_1.data.csv?select=geography_code%2Cc_health_name%2Cobs_value&rural_urban=0&measures=20100&time=latest&geography=', 'general_health', '2018-01-10 14:58:43.026577', 'lad,msoa,lsoa,oa,rgn,wd', 'OGL', NULL, 'Census 2011', 'QS302EW', 'Pie chart', NULL, 'https://www.nomisweb.co.uk/api/v01/help', NULL, 'ons', 't', 't'),
(7, 'Tenure - Households', 'This dataset provides 2011 estimates that classify households in England and Wales by tenure.', '2011-03-27', 'Office of National Statistics', 'https://www.nomisweb.co.uk/census/2011/qs405ew', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_537_1.data.csv?select=geography_code%2Cc_tenhuk11_name%2Cobs_value&rural_urban=0&measures=20100&time=latest&geography=', 'tenure', '2018-01-11 13:35:01.59991', 'lad,msoa,lsoa,oa,rgn,wd', 'OGL', NULL, 'Census 2011', 'QS405EW', 'Pie chart', NULL, 'https://www.nomisweb.co.uk/api/v01/help', NULL, 'ons', 't', 't'),
(4, 'Method of travel to work', 'This dataset provides 2011 estimates that classify usual residents aged 16 to 74 in England and Wales by their method of travel to work. ', '2011-03-27', 'Office of National Statistics', 'https://www.nomisweb.co.uk/census/2011/qs701ew', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_568_1.data.csv?select=geography_code%2Ccell_name%2Cobs_value&rural_urban=0&measures=20100&&time=latest&geography=', 'travel_towork', '2018-01-10 14:15:28.67208', 'lad,msoa,lsoa,oa,rgn,wd', 'OGL', NULL, 'Census 2011', 'QS701EW', 'Pie chart', NULL, 'https://www.nomisweb.co.uk/api/v01/help', NULL, 'ons', 't', 't'),
(16, 'Economic Activity', 'This dataset provides 2011 estimates that classify usual residents aged 16 to 74 in England and Wales by economic activity.', '2011-03-27', 'Office of National Statistics', 'https://www.nomisweb.co.uk/census/2011/qs601ew', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_556_1.data.csv?select=geography_code%2Ccell_name%2Cobs_value&rural_urban=0&measures=20100&time=latest&geography=', 'econ_activ', '2018-03-08 14:45:23.40998', 'lad,msoa,lsoa,oa,rgn,wd', 'OGL', NULL, 'Census 2011', 'QS601EW', NULL, NULL, 'https://www.nomisweb.co.uk/api/v01/dataset/NM_556_1.def.htm', NULL, 'ons', 't', 't'),
(13, 'Population estimates', 'Annual population estimates for the UK and its constituent countries, the regions and counties of England, and local authorities and their equivalents. Estimates for lower and middle layer Super Output Areas, Westminster parliamentary constituencies, electoral wards and National Parks in England and Wales and clinical commissioning groups in England.', '2017-06-22', 'Office of National Statistics', 'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates', '/api/data/pop', 'mid16_est_lsoa_pop', '2018-02-25 11:41:49.947363', 'lsoa,lad', 'OGL', 'Mid year population estimates', 'ONS', NULL, 'Pie cart', 'annual', NULL, NULL, 'ons', 't', 'f'),
(1, 'Index of Multiple Deprivation', 'The Index of Multiple Deprivation is the official measure of relative deprivation for small areas(or neighbourhoods) in England. ', '2015-09-30', 'Department for Communities and Local Government', 'https://www.gov.uk/government/statistics/english-indices-of-deprivation-2015', '/api/data/imd', 'imd_2015', '2017-08-22 14:00:36.074772', 'lsoa', 'OGL', 'Contains compained index of multiple deprivation in the UK', 'DCLG', NULL, '', '', NULL, NULL, 'ons', 't', 'f'),
(3, 'Population density', 'This dataset provides 2011 estimates of the usual resident population of England and Wales. ', '2011-03-27', 'Office of National Statistics', 'https://www.nomisweb.co.uk/census/2011/qs102ew', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_143_1.data.csv?select=geography_code%2Ccell_name%2Cobs_value&rural_urban=0&measures=20100&time=latest&geography=', 'population_density', '2018-01-10 09:14:37.298116', 'lad,msoa,lsoa,oa,rgn,wd', 'OGL', NULL, 'Census 2011', 'QS102EW', NULL, NULL,'https://www.nomisweb.co.uk/api/v01/help', NULL, 'ons', 't', 't'),
(2, 'Street-level crimes', 'Crimes at street-level; either within a 1 mile radius of a single point, or within a custom area. Crimes at street-level; either within a 1 mile radius of a single point, or within a custom area.', '2010-01-01', 'Home Office', 'https://data.police.uk/', 'https://data.police.uk/api/crimes-street/all-crime?poly=', 'crimes_street', '2018-01-08 16:30:24.04008', 'latlon', 'OGL', NULL, 'data.police.uk', NULL, NULL, NULL, 'https://data.police.uk/docs/', NULL, 'poly', 't', 't'),
(12, 'Public Health', NULL, NULL, NULL, NULL, '/api/data/pubhealth', NULL, '2018-02-09 16:00:16.840721', NULL, NULL, NULL, 'Public Health England', NULL, NULL, NULL, NULL, NULL, NULL, 'f', 'f'),
(14, 'Jobs Density', 'The numbers of jobs per resident aged 16-64. The total number of jobs is a workplace-based measure and comprises employees, self-employed, government-supported trainees and HM Forces.', '2018-01-24', 'Office of National Statistics', 'https://www.nomisweb.co.uk/query/construct/summary.asp?mode=construct&version=0&dataset=57', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_57_1.data.csv?select=geography_code%2Citem_name%2Cobs_value&measures=20100&time=latest&geography=', 'jobs_density', '2018-02-25 12:14:53.755759', 'lad,rgn', 'OGL', 'Latest dataset of jobs and density', 'ONS', NULL, NULL, 'annual', 'https://www.nomisweb.co.uk/api/v01/dataset/NM_57_1.def.html', NULL, 'ons', 't', 't'),
(17, 'UK Schools Absence', 'Statistics on overall authorised and unauthorised pupil absences by school type, including persistent absentees and pupil characteristics.', '2013-11-15', NULL, 'https://www.gov.uk/government/collections/statistics-pupil-absence', '/api/data/schabs', 'ukschools_abs', '2018-03-27 18:22:07.527114', 'latlon', 'OGL', NULL, 'DfE', NULL, NULL, 'annual', NULL, NULL, 'latlon', 'f', 'f'),
(15, 'UK Schools', 'Information about all state-funded and independent schools in England.', '2014-08-20', 'Department of Education', 'https://www.gov.uk/government/organisations/department-for-education', '/api/data/schools', 'ukschools_selection', '2018-03-08 09:56:02.101645', 'latlon', 'OGL', NULL, 'DfE', NULL, NULL, NULL, NULL, NULL, 'latlon', 't', 'f'),
(9, 'Community Workshops', 'Community conversational workshop data', NULL, 'Open Lab', NULL, '/api/data/cc', 'cc_t1simple', '2018-01-30 11:22:41.460889', 'lad,msoa,lsoa,oa,rgn,wd', NULL, NULL, 'Community Conversational', NULL, 'Audio', NULL, NULL, NULL, 'latlon', 'f', 'f'),
(8, 'Urban Observatory', 'The largest set of publicly available real time urban data in the UK.', '2010-01-01', 'Urban Observatory', 'http://www.urbanobservatory.ac.uk/', 'https://api.newcastle.urbanobservatory.ac.uk/api/v1/sensors.csv?bbox=', 'urbanobs', '2018-01-13 18:02:39.057303', 'bbox,buffer', NULL, NULL, 'Orban Observatory', NULL, NULL, 'realtime', 'http://uoweb1.ncl.ac.uk/api_page/', '6m4n39t9uh3macw06et661912n28cozsytse1pxiemmpamulzmy08aq2aol2b22pdwi2xd5hmgvmtrlld6h2z32zjd', 'bbox', 't', 't');


COMMIT;
