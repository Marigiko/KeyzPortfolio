<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'if0_35136567_portfolio_db' );

/** Database username */
define( 'DB_USER', 'if0_35136567' );

/** Database password */
define( 'DB_PASSWORD', '5Wc52JzGOz' );

/** Database hostname */
define( 'DB_HOST', 'sql301.infinityfree.com' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'uWls^!+`2U-v9+3iX(oq)$2s;s^!_bat{%4%>TC/`Pr1/NHr*/CH:&Ef64<P?8){' );
define( 'SECURE_AUTH_KEY',  'YU*U.9 e-VaV~ Hu)mpNIRLO22)st*$3oadI00Xg=ZWtI+46v0Kd+L@qT8J_@BO|' );
define( 'LOGGED_IN_KEY',    'IoHqtZGcK8YSA1:X>4ePKW=7rg+p#)<>7xihZBR@KGmp@l~<Z.G56QSZ}RU3Q?*[' );
define( 'NONCE_KEY',        'NY5#wX47!Jf/c50TN2|}CG;gx6sU-C2q? LXau +M9(}U!C.Nb),7FVF,3E&ycPq' );
define( 'AUTH_SALT',        '||,WOEyo0v}HrFup94ky^Tu_hoy)k?%KNPZ]Na3b@CMU?ud!qu6B+PK((UW1am9)' );
define( 'SECURE_AUTH_SALT', 'TO_o2qcq2rdk)DyyPi*Pbh6-}hjYZ;tNF6$,6t5ypO%uU2%!JeMs^.g%{fSi?.4m' );
define( 'LOGGED_IN_SALT',   't|brTgb_yj8#AUrY|g9< :aCgqvDjCX78[oLOG.mpDG1-Hz=9dEd3-+iI/cTJ8nR' );
define( 'NONCE_SALT',       'Ue;JYU1[bjF+)gV#I:2NoJuPy0ffg!qN,&.7<J)vN)>r,a~/VPCyOyn^C]}8R.}(' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
