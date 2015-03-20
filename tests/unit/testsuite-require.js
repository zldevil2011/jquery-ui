( function() {

window.requirejs = {
	paths: {
		"helper": "../helper",
		"jquery": jqueryUrl(),
		"jquery.simulate": "../../../external/jquery-simulate/jquery.simulate",
		"jshint": "../../../external/jshint/jshint",
		"qunit": "../qunit",
		"qunit-assert-classes": "../../../external/qunit-assert-classes/qunit-assert-classes",
		"qunit-core": "../../../external/qunit/qunit",
		"ui": "../../../ui"
	},
	shim: {
		"jquery.simulate": [ "jquery" ],
		"qunit-assert-classes": [ "qunit-core" ]
	}
};

function requireModules( dependencies, callback, modules ) {
	if ( !dependencies.length ) {
		if ( callback ) {
			callback.apply( null, modules );
		}
		return;
	}

	if ( !modules ) {
		modules = [];
	}

	var dependency = dependencies.shift();
	require( [ dependency ], function( module ) {
		modules.push( module );
		requireModules( dependencies, callback, modules );
	} );
}

window.requireTests = function( dependencies, callback ) {
	dependencies = [
		"qunit",
		"jquery"
	].concat( dependencies );

	requireModules( dependencies, function() {
		swarmInject();
		QUnit.start();
	} );
}

function parseUrl() {
	var data = {};
	var parts = document.location.search.slice( 1 ).split( "&" );
	var length = parts.length;
	var i = 0;
	var current;

	for ( ; i < length; i++ ) {
		current = parts[ i ].split( "=" );
		data[ current[ 0 ] ] = current[ 1 ];
	}

	return data;
}

function jqueryUrl() {
	var version = parseUrl().jquery;
	var url;

	if ( version === "git" ) {
		url = "http://code.jquery.com/jquery-git.js";
	} else {
		url = "../../../external/jquery-" + ( version || "1.10.2" ) + "/jquery";
	}

	return url;
};

function swarmInject() {
	var url = parseUrl().swarmURL;

	if ( !url || url.indexOf( "http" ) !== 0 ) {
		return;
	}

	document.write( "<script src='http://swarm.jquery.org/js/inject.js?" +
		(new Date()).getTime() + "'></script>" );
}

(function() {

	// Find the script element
	var scripts = document.getElementsByTagName( "script" );
	var script = scripts[ scripts.length - 1 ];

	// Read the modules
	var modules = ( script.getAttribute( "data-modules" ) || "" )
		.replace( /^\s+|\s+$/g, "" )
		.split( /\s+/ );
	var widget = script.getAttribute( "data-widget" );
	var deprecated = script.getAttribute( "data-deprecated" );
	if ( widget ) {
		modules = modules.concat([
			widget + ( deprecated ? "_common_deprecated" : "_common" ),
			widget + "_core",
			widget + "_events",
			widget + "_methods",
			widget + "_options"
		]);
		if ( deprecated ) {
			modules = modules.concat( widget + "_deprecated" );
		}
	}

	// Load requirejs, then load the tests
	script = document.createElement( "script" );
	script.src = "../../../external/requirejs/require.js";
	script.onload = function() {
		requireTests( modules );
	};
	document.documentElement.appendChild( script );
} )();

} )();
