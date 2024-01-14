<?php
/* @var $this NewsletterStatisticsAdmin */
/* @var $controls NewsletterControls */

defined('ABSPATH') || exit;
$email = $this->get_email($_GET['id']);
?>

<div class="wrap tnp-statistics tnp-statistics-view" id="tnp-wrap">
    <?php include NEWSLETTER_ADMIN_HEADER ?>
    <div id="tnp-heading">
        <h2><?php echo esc_html($email->subject) ?></h2>
        <?php include __DIR__ . '/nav.php'?>
    </div>

    <div id="tnp-body">
        <p>
            Details by single clicked link are available with the <a href="https://www.thenewsletterplugin.com/reports" target="_blank">Reports addon</a>.
        </p>
        
    </div>
    <?php include NEWSLETTER_DIR . '/tnp-footer.php' ?>
</div>
