<?php
/* @var $this NewsletterSubscriptionAdmin */
/* @var $controls NewsletterControls */
/* @var $logger NewsletterLogger */

defined('ABSPATH') || exit;

if (!$controls->is_action()) {
    $controls->data = $this->get_options('form', $language);
} else {
    if ($controls->is_action('save')) {
        if (!!$language) {
            foreach ($controls->data as $k => $v) {
                if ($v === '') {
                    //unset($controls->data[$k]);
                }
            }
        }

        // Processing profile fields
        if (!$language) {
            for ($i = 1; $i <= NEWSLETTER_PROFILE_MAX; $i++) {
                if (empty($controls->data['profile_' . $i])) {
                    unset($controls->data['profile_' . $i]);
                }
                if (empty($controls->data['profile_' . $i . '_options'])) {
                    unset($controls->data['profile_' . $i . '_options']);
                }
                if (empty($controls->data['profile_' . $i . '_placeholder'])) {
                    unset($controls->data['profile_' . $i . '_placeholder']);
                }
            }
        }
        $this->save_options($controls->data, 'form', $language);
        $controls->data = $this->get_options('form', $language);
        $controls->add_message_saved();
    }
}

$status = array(0 => __('Hide', 'newsletter'), 1 => __('Show', 'newsletter'));
$rules = array(0 => __('Optional', 'newsletter'), 1 => __('Required', 'newsletter'));
$extra_type = array('text' => __('Text', 'newsletter'), 'select' => __('List', 'newsletter'));

$main_options = $this->get_main_options('form');
?>

<div class="wrap" id="tnp-wrap">

    <?php include NEWSLETTER_ADMIN_HEADER ?>

    <div id="tnp-heading">

        <h2><?php _e('Subscription', 'newsletter') ?></h2>
        <?php include __DIR__ . '/nav.php' ?>

    </div>

    <div id="tnp-body">

        <?php $controls->show(); ?>

        <p>
        <ul>
            <li>
                Create forms with <a href="https://www.thenewsletterplugin.com/documentation/subscription/subscription-form-shortcodes/" target="_blank">shortcodes</a></li>
            </li>
            <li>
                Customize newsletters with <a href="https://www.thenewsletterplugin.com/documentation/newsletters/newsletter-tags/" target="_blank">subscriber data tags</a>
            </li>
            <li>
                <a href="?page=newsletter_subscription_forms"><?php _e('HTML coded forms', 'newsletter') ?></a>
            </li>
            </p>
            <form action="" method="post">
                <?php $controls->init(); ?>

                <div id="tabs">

                    <ul>
                        <li><a href="#tabs-fields"><?php _e('Main fields', 'newsletter') ?></a></li>
                        <li><a href="#tabs-lists"><?php _e('Lists', 'newsletter') ?></a></li>
                        <li><a href="#tabs-customfields"><?php _e('Custom fields', 'newsletter') ?></a></li>
                        <?php if (NEWSLETTER_DEBUG) { ?>
                            <li><a href="#tabs-debug">Debug</a></li>
                        <?php } ?>
                    </ul>

                    <div id="tabs-fields">

                        <?php $this->language_notice(); ?>

                        <table class="form-table">
                            <tr>
                                <th><?php _e('Email', 'newsletter') ?></th>
                                <td>
                                    <?php if (!$language) { ?>
                                        <input type="checkbox" checked disabled> 
                                    <?php } ?>
                                    <?php $controls->text('email', 20, $this->get_default_text('email', 'form')); ?>

                                    <span class="description">Placeholder for newsletters: {email}</span>
                                </td>
                            </tr>

                            <tr>
                                <th><?php _e('First name', 'newsletter') ?></th>
                                <td>

                                    <?php if (!$language) { ?>
                                        <?php $controls->checkbox2('name_status', '', ['title' => __('Show', 'newsletter')]); ?>
                                    <?php } ?>

                                    <?php $controls->text('name', 20, $this->get_default_text('name', 'form')); ?>

                                    <?php if (!$language) { ?>
                                        <?php $controls->select('name_rules', $rules); ?>
                                    <?php } ?>
                                    <span class="description">Placeholder for newsletters: {name}</span>


                                </td>
                            </tr>
                            <tr>
                                <th><?php _e('Last name', 'newsletter') ?></th>
                                <td>
                                    <?php if (!$language) { ?>
                                        <?php $controls->checkbox2('surname_status', '', ['title' => __('Show', 'newsletter')]); ?>
                                    <?php } ?>

                                    <?php $controls->text('surname', 20, $this->get_default_text('surname', 'form')); ?>

                                    <?php if (!$language) { ?>
                                        <?php $controls->select('surname_rules', $rules); ?>
                                    <?php } ?>
                                    <span class="description">Placeholder for newsletters: {surname}</span>
                                </td>
                            </tr>
                            <tr>
                                <th><?php _e('Gender', 'newsletter') ?></th>
                                <td>
                                    <?php if (!$language) { ?>
                                        <?php $controls->checkbox2('sex_status'); ?>
                                    <?php } ?>
                                    <?php $controls->text('sex', 20, $this->get_default_text('sex', 'form')); ?>
                                    <?php if (!$language) { ?>
                                        <?php $controls->select('sex_rules', $rules); ?>
                                    <?php } ?>
                                    <br><br>

                                    <strong><?php _e('Option labels', 'newsletter') ?></strong>
                                    <br>
                                    <?php $controls->text('sex_none', 20, $this->get_default_text('sex_none', 'form')); ?>
                                    <?php $controls->text('sex_female', 20, $this->get_default_text('sex_female', 'form')); ?>
                                    <?php $controls->text('sex_male', 20, $this->get_default_text('sex_male', 'form')); ?>
                                    <br><br>
                                    <strong><?php _e('Salutation', 'newsletter') ?></strong>
                                    <div class="tnpc-fields-row">
                                        <div class="tnpc-field">
                                            <label><?php _e('Generic', 'newsletter') ?></label>
                                            <?php $controls->text('title_none', 10, $this->get_default_text('title_none', 'form')); ?>
                                        </div>
                                        <div class="tnpc-field">
                                            <label><?php _e('Female', 'newsletter') ?></label>
                                            <?php $controls->text('title_female', 10, $this->get_default_text('title_female', 'form')); ?>
                                        </div>
                                        <div class="tnpc-field">
                                            <label><?php _e('Male', 'newsletter') ?></label>
                                            <?php $controls->text('title_male', 10, $this->get_default_text('title_male', 'form')); ?>
                                        </div>
                                    </div>

                                    <p class="description">
                                        <?php _e('Salutation titles are inserted in emails message when the tag {title} is used. For example "Good morning {title} {surname} {name}".', 'newsletter') ?>
                                    </p>
                                </td>
                            </tr>



                            <tr>
                                <th><?php _e('Button', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->text('subscribe', 40, $this->get_default_text('subscribe', 'form')); ?>
                                </td>
                            </tr>

                            <tr>
                                <th><?php _e('Privacy checkbox/notice', 'newsletter') ?></th>
                                <td>
                                    <table class="tnpc-grid">
                                        <?php if (!$language) { ?>
                                            <tr><th><?php _e('Enabled?', 'newsletter') ?></th><td><?php $controls->select('privacy_status', array(0 => __('No', 'newsletter'), 1 => __('Yes', 'newsletter'), 2 => __('Only the notice', 'newsletter'))); ?></td></tr>
                                        <?php } ?>
                                        <tr><th><?php _e('Label', 'newsletter') ?></th><td><?php $controls->text('privacy', 50, $this->get_default_text('privacy', 'form')); ?></td></tr>
                                        <tr>
                                            <th>Privacy URL</th>
                                            <td>
                                                <?php if (!!$language && !empty($controls->data['privacy_use_wp_url'])) { ?>
                                                    <?php _e('The "all language" setting is set to use the WordPress default privacy page. Please translate that page.', 'newsletter') ?>
                                                <?php } else { ?>
                                                    <?php if (!$language) { ?>
                                                        <?php if (function_exists('get_privacy_policy_url') && get_privacy_policy_url()) { ?>
                                                            <?php $controls->checkbox('privacy_use_wp_url', __('Use WordPress privacy URL', 'newsletter')); ?>
                                                            (<a href="<?php echo esc_attr(get_privacy_policy_url()) ?>"><?php echo esc_html(get_privacy_policy_url()) ?></a>)
                                                            <br>OR<br>
                                                        <?php } ?>
                                                    <?php } ?>
                                                    <?php if (!!$language) { ?>
                                                        <?php _e('To use the WordPress privacy page, switch to "all language" and activate it.', 'newsletter') ?><br>
                                                    <?php } ?>
                                                    <?php $controls->text_url('privacy_url', 50); ?>
                                                <?php } ?>
                                            </td>
                                        </tr>
                                    </table>
                                    <div class="tnpc-hint">
                                        <?php _e('The privacy acceptance checkbox (required in many Europen countries) forces the subscriber to check it before proceeding. If an URL is specified the label becomes a link.', 'newsletter') ?>
                                    </div>
                                </td>
                            </tr>

                        </table>
                    </div>

                    <div id="tabs-lists">

                        <?php $this->language_notice(); ?>

                        <p>
                            <a href="?page=newsletter_subscription_lists" target="_blank"><?php _e('Configure', 'newsletter') ?></a>
                        </p>

                        <?php if (!$language) { ?>

                            <?php
                            $lists = $this->get_lists_public();
                            ?>
                            <table class="widefat" style="width: auto">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th><?php _e('Show', 'newsletter') ?></th>
                                        <th><?php _e('Checked', 'newsletter') ?></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($lists as $list) { ?>
                                        <tr>
                                            <td><?php echo esc_html($list->id) ?></td>
                                            <td><?php echo esc_html($list->name) ?></td>
                                            <td><?php $controls->checkbox_group('lists', $list->id) ?></td>
                                            <td><?php $controls->checkbox_group('lists_checked', $list->id) ?></td>
                                        </tr>
                                    <?php } ?>
                                </tbody>

                            </table>

                        <?php } ?>
                    </div>

                    <div id="tabs-customfields">

                        <?php $this->language_notice(); ?>

                        <p>
                            <a href="?page=newsletter_subscription_customfields" target="_blank"><?php _e('Configure', 'newsletter') ?></a>
                        </p>
                        <?php if (!$language) { ?>
                            <?php
                            $customfields = $this->get_customfields_public();
                            ?>

                            <table class="widefat" style="width: auto">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th><?php _e('Show', 'newsletter') ?></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($customfields as $customfield) { ?>
                                        <tr>
                                            <td><?php echo esc_html($customfield->id) ?></td>
                                            <td><?php echo esc_html($customfield->name) ?></td>
                                            <td><?php $controls->checkbox_group('customfields', $customfield->id) ?></td>
                                        </tr>
                                    <?php } ?>
                                </tbody>

                            </table>
                        <?php } ?>

                    </div>

                    <?php if (NEWSLETTER_DEBUG) { ?>
                        <div id="tabs-debug">
                            <pre><?php echo esc_html(json_encode($this->get_db_options('form', $language), JSON_PRETTY_PRINT)) ?></pre>
                        </div>
                    <?php } ?>



                </div>

                <p>
                    <?php $controls->button_save(); ?>
                </p>

            </form>


    </div>

    <?php include NEWSLETTER_ADMIN_FOOTER ?>

</div>
