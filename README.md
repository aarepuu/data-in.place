## About

**DATA:IN PLACE** is geographic information system (GIS) for accessing and visualising open data. System leverages an open source web tool [RAWGraphs](http://rawgraphs.io/) by [DensityDesign Research Lab](http://www.densitydesign.org/) ([Politecnico di Milano](http://www.polimi.it/)) and [Calibro](http://calib.ro/) to create custom vector-based visualisations from open data.
It has been developed in [Open Lab]() by [Aare Puussaar]().


System connects to real time open governmental datasources (e.g., Office of National Statistics, Home Office, NHS, Department of Education, Ministry of Housing, Communities and Local Government etc.) and provides a interface for making place based queries. Instead of writing complex queries or scrolling through endless lists of tables to get the relevant data you need, you can use the map to focus on a specific area (i.e. draw a boundary on a map). Also by zooming in and out the area, the system displays statistics on different UK administration level (i.e. output areas, wards, local authorities, counties).
DATA:IN PLACE aims to make open data accessible and usable for non-professionals.

It also enables you to add your own datasets from different sources - pasting as text, from a file or from an url. System automatically then finds any geographical information (e.g. longitude and latitude, postcodes, ONS codes) from your data and outputs it onto the map. 
This feature of the system gives the ability to overlay and intersect datasets (e.g. geographic surveys, local consultation data) collected by the community or other groups with the open datasets.

DATA:IN PLACE also enables you to request open datasets to be added to the platform and linked to the map based query system.

- App page: [data-in.place](https://app.data-in.place)
- Project official page: [rawgraphs.io](http://data-in.place)
- Documentation: [github.com/aarepuu/data-in.place/wiki](https://github.com/aarepuu/data-in.place/wiki)


## Usage
The easiest way to use DATA:IN PLACE is by accessing the most updated version on the **[official app page](https://app.data-in.place)**. However, Data:In Place can also run locally on your machine: see the installation instructions below to know how.

## Installation
If you want to run your instance of RAW locally on your machine, be sure you have the following requirements installed.

### Requirements

- [git](http://git-scm.com/book/en/Getting-Started-Installing-Git)
- [PostgreSQL](https://www.postgresql.org/download/)
- [PostGIS](https://postgis.net/install/)
- [npm](https://www.npmjs.com/get-npm)
- [Bower](http://bower.io/#installing-bower)

### Prerequisites

Create database for the application

``` sh
$ psql
$ postgres=> CREATE DATABASE data_in_place;
```

### Instructions

Clone DATA:IN PLACE from the command line:

``` sh
$ git clone https://github.com/aarepuu/data-in.place.git
```

browse to DATA:IN PLACE root folder:

``` sh
$ cd data-in.place
```

install server-side dependencies:

``` sh
$ npm install
```

install client-side dependencies:

``` sh
$ bower install
```

add analytics script:

``` sh
$ cp js/analytics.sample.js js/analytics.js
```

open the file ```js/analytics.js``` and add your analytics code (if any), otherwise leave the file as is.


You can now run RAW from your local web server using node:

``` sh
$ node server/index.js
```

Once this is running, go to [http://localhost:3000/](http://localhost:3000/).



## Documentation and Support

Documentation and FAQs about how to use Data:In Place can be found on the [github.com/aarepuu/data-in.place/wiki](https://github.com/aarepuu/data-in.place/wiki).

## RAWGRAPHS

Documentation and FAQs about how to use RAWGraphs can be found on the [wiki](https://github.com/densitydesign/raw/wiki/).
Information about the available charts can be found [here](https://github.com/densitydesign/raw/wiki/Available-Charts). Adding new charts is very easy in RAW, see how [here](https://github.com/densitydesign/raw/wiki/Adding-New-Charts)!


## Libraries

**DATA:IN PLACE** has been developed using a lot of cool stuff found out there:

[nodejs](http://nodejs.org)

[npm](https://www.npmjs.com/get-npm)

[Express](https://expressjs.com/)

[node-postgres](https://node-postgres.com/)

[leafletjs](http://leafletjs.com/)

[GeoJSON.js](https://github.com/caseycesari/geojson.js)

[GeoJSON-Validation](https://github.com/craveprogramminginc/GeoJSON-Validation)




plus the stuff that make up **RAW**

[angular.js](https://github.com/angular/angular.js)

[angular-bootstrap-colorpicker](https://github.com/buberdds/angular-bootstrap-colorpicker)

[angular-ui](https://github.com/angular-ui)

[bootstrap](https://github.com/twbs/bootstrap)

[bootstrap-colorpicker](http://www.eyecon.ro/bootstrap-colorpicker/)

[Bower](https://github.com/bower/bower)

[canvas-toBlob.js](https://github.com/eligrey/canvas-toBlob.js)

[CodeMirror](https://github.com/marijnh/codemirror)

[d3.js](https://github.com/mbostock/d3)

[FileSaver.js](https://github.com/eligrey/FileSaver.js)

[is.js](http://is.js.org/)

[jQuery](https://github.com/jquery/jquery)

[jQuery UI Touch Punch](https://github.com/furf/jquery-ui-touch-punch/)

[NG file upload](https://github.com/danialfarid/ng-file-upload)

[Sheet JS](https://github.com/SheetJS)

[ZeroClipboard](https://github.com/zeroclipboard/zeroclipboard)


## Authors

**DATA:IN PLACE** has been originally developed by:

* Aare Puussaar <a.puussaar2@ncl.ac.uk>

**RAW** has been originally developed by:

* Giorgio Caviglia <giorgio.caviglia@gmail.com>
* Michele Mauri <mikimauri@gmail.com>
* Giorgio Uboldi <giorgio@calib.ro>
* Matteo Azzi <matteo@calib.ro>

## License

DATA:IN PLACE is provided under [MIT](https://github.com/aarepuu/data-in.place/blob/master/LICENSE):

	Copyright (c), 2016-2018 Open Lab at Newcastle University, Aare Puussaar

	<openlab@ncl.ac.uk>
	<a.puussaar2@ncl.ac.uk>

	Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		https://opensource.org/licenses/MIT

	Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and limitations under the License.



RAW is provided under the [Apache License 2.0](https://github.com/densitydesign/raw/blob/master/LICENSE):

	Copyright (c), 2013-2017 DensityDesign Lab, Giorgio Caviglia, Michele Mauri, Giorgio Uboldi, Matteo Azzi

	<info@densitydesign.org>
	<giorgio.caviglia@gmail.com>
	<mikimauri@gmail.com>
	<giorgio@calib.ro>
	<matteo@calib.ro>

	Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and limitations under the License.

## Funding

This research was funded through the [EPSRC](https://www.epsrc.ac.uk/) Centre for Doctoral Training in Digital Civics (EP/L016176/1).
