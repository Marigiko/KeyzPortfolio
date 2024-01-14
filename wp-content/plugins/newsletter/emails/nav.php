<?php
?>
<ul class="tnp-nav">
    <!--<li class="tnp-nav-title">Subscription</li>-->
    <li class="<?php echo $_GET['page'] === 'newsletter_emails_index'?'active':''?>"><a href="?page=newsletter_emails_index"><?php _e('Newsletters', 'newsletter')?></a></li>
    <li class="<?php echo $_GET['page'] === 'newsletter_emails_presets'?'active':''?>"><a href="?page=newsletter_emails_presets"><?php _e('Templates', 'newsletter')?></a></li>
</ul>
