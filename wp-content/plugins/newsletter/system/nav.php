<?php
?>
<ul class="tnp-nav">
    <!--<li class="tnp-nav-title">Subscription</li>-->
    <li class="<?php echo $_GET['page'] === 'newsletter_system_status'?'active':''?>"><a href="?page=newsletter_system_status">General</a></li>
    <li class="<?php echo $_GET['page'] === 'newsletter_system_delivery'?'active':''?>"><a href="?page=newsletter_system_delivery">Delivery</a></li>
    <li class="<?php echo $_GET['page'] === 'newsletter_system_scheduler'?'active':''?>"><a href="?page=newsletter_system_scheduler">Scheduler</a></li>
    <li class="<?php echo $_GET['page'] === 'newsletter_system_logs'?'active':''?>"><a href="?page=newsletter_system_logs">Logs</a></li>
    <li><a href="<?php echo admin_url('site-health.php') ?>" target="_tab">WP Site Health</a></li>
</ul>
