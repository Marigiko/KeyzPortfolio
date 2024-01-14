<?php
/* @var $this NewsletterProfileAdmin */
/* @var $controls NewsletterControls */

defined('ABSPATH') || exit;

if ($controls->is_action()) {
    if ($controls->is_action('save')) {
        foreach ($controls->data as $k => $v) {
            if (strpos($k, '_custom') > 0) {
                if (empty($v)) {
                    $controls->data[str_replace('_custom', '', $k)] = '';
                }
                unset($controls->data[$k]);
            }
        }
        $this->save_options($controls->data, '', $language);
        $controls->add_message_saved();
    }
} else {
    $controls->data = $this->get_options('', $language);
}

foreach (['text'] as $key) {
    if (!empty($controls->data[$key])) {
        $controls->data[$key . '_custom'] = '1';
    }
}
?>

<div class="wrap tnp-profile tnp-profile-index" id="tnp-wrap">

    <?php include NEWSLETTER_ADMIN_HEADER ?>

    <div id="tnp-heading">
        <?php $controls->title_help('/profile-page') ?>
        <h2><?php _e('Subscribers', 'newsletter') ?></h2>
        <?php include __DIR__ . '/../users/nav.php' ?>

    </div>

    <div id="tnp-body">

        <?php $controls->show() ?>
        <p>Where your subscribers can change their data.</p>

        <form id="channel" method="post" action="">
            <?php $controls->init(); ?>
            <div id="tabs">
                <ul>
                    <li><a href="#tabs-general"><?php _e('General', 'newsletter') ?></a></li>
                    <li><a href="#tabs-fields"><?php _e('Form', 'newsletter') ?></a></li>
                    <li><a href="#tabs-labels"><?php _e('Messages and labels', 'newsletter') ?></a></li>
                    <li><a href="#tabs-export"><?php _e('Subscriber data export', 'newsletter') ?></a></li>
                    <?php if (NEWSLETTER_DEBUG) { ?>
                        <li><a href="#tabs-debug">Debug</a></li>
                    <?php } ?>
                </ul>

                <div id="tabs-general">

                    <table class="form-table">

                        <tr>
                            <th><?php _e('Profile page', 'newsletter') ?>
                            </th>
                            <td>

                                <?php $controls->checkbox2('text_custom', 'Customize', ['onchange' => 'tnp_refresh_binds()']); ?>
                                <div data-bind="options-text_custom">
                                    <?php $controls->wp_editor('text', ['editor_height' => 150], ['default' => $this->get_default_text('text')]); ?>
                                </div>
                                <div data-bind="!options-text_custom" class="tnpc-default-text">
                                    <?php echo wp_kses_post($this->get_default_text('text')) ?>
                                </div>
                                <p class="description">
                                    Shown inside the Newsletter dedicated page. Use <code>[newsletter_profile]</code> where you want the edit form
                                    to be inserted. Create a link with URL <code>{unsubscribe_url}</code> to give access to the cancellation page.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <th><?php _e('Alternative URL', 'newsletter') ?></th>
                            <td>
                                <?php $controls->text('url', 70); ?>
                                <p class="description">
                                    The specified page should containt the <code>[newsletter_profile]</code> shortcode to insert the data form.
                                </p>
                            </td>
                        </tr>

                    </table>
                </div>

                <div id="tabs-fields">
                    <?php $this->language_notice() ?>

                    <?php if (!$language) { ?>


                        <table class="widefat" style="width: auto">
                            <thead>
                                <tr>
                                    <th><?php _e('Field', 'newsletter') ?></th>
                                    <th>
                                        <?php _e('Show', 'newsletter') ?>
                                    </th>
                                    <th>
                                        <?php _e('Required', 'newsletter') ?></th>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th><?php _e('Email', 'newsletter') ?></th>
                                    <td>
                                        <?php $controls->checkbox2('email') ?>
                                    </td>
                                    <td>

                                        <input type="checkbox" checked disabled>

                                    </td>
                                </tr>
                                <tr>
                                    <th><?php _e('First name', 'newsletter') ?></th>
                                    <td>
                                        <?php $controls->checkbox2('name') ?>
                                    </td>
                                    <td>
                                        <?php $controls->checkbox2('name_required') ?>
                                    </td>
                                </tr>
                                <tr>
                                    <th><?php _e('Last name', 'newsletter') ?></th>
                                    <td>
                                        <?php $controls->checkbox2('surname') ?>
                                    </td>
                                    <td>
                                        <?php $controls->checkbox2('surname_required') ?>
                                    </td>
                                </tr>
                                <tr>
                                    <th><?php _e('Gender', 'newsletter') ?></th>

                                    <td>
                                        <?php $controls->checkbox2('sex') ?>
                                    </td>
                                </tr>
                                <tr>
                                    <th><?php _e('Language', 'newsletter') ?></th>

                                    <td>
                                        <?php $controls->checkbox2('language') ?>
                                    </td>
                                    <td></td>
                                </tr>

                                <tr>
                                    <th><?php _e('Lists', 'newsletter') ?></th>

                                    <td>
                                        <?php $controls->lists_public() ?>
                                    </td>
                                    <td>
                                    </td>
                                </tr>

                                <tr>
                                    <th><?php _e('Custom fields', 'newsletter') ?></th>

                                    <td>
                                        <?php $controls->profiles_public('profiles'); ?>
                                        <p>
                                            <a href="?page=newsletter_subscription_customfields" target="_blank"><?php _e('Configure', 'newsletter') ?></a>
                                        </p>
                                    </td>
                                    <td>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    <?php } ?>
                </div>





                <div id="tabs-labels">
                    <?php $this->language_notice() ?>
                    <table class="form-table">
                        <tr>
                            <th><?php _e('Profile saved', 'newsletter') ?></th>
                            <td>
                                <?php $controls->text('saved', 80, $this->get_default_text('saved')); ?>
                            </td>
                        </tr>

                        <tr>
                        <tr>
                            <th><?php _e('Email changed alert', 'newsletter') ?></th>
                            <td>
                                <?php $controls->text('email_changed', 80, $this->get_default_text('email_changed')); ?>
                            </td>
                        </tr>

                        <tr>

                        <tr>
                        <tr>
                            <th><?php _e('General error', 'newsletter') ?></th>
                            <td>
                                <?php $controls->text('error', 80, $this->get_default_text('error')); ?>
                            </td>
                        </tr>

                        <tr>
                            <th><?php _e('"Save" label', 'newsletter') ?></th>
                            <td>
                                <?php $controls->text('save_label', 30, $this->get_default_text('save_label')); ?>
                            </td>
                        </tr>

                        <tr>
                            <th><?php _e('Privacy link text', 'newsletter') ?></th>
                            <td>
                                <?php $controls->text('privacy_label', 80, $this->get_default_text('privacy_label')); ?>
                                <p class="description">

                                </p>
                            </td>
                        </tr>

                    </table>
                </div>

                <div id="tabs-export">

                    <?php $this->language_notice() ?>
                    <?php if (!$language) { ?>

                        <table class="form-table">

                            <tr>
                                <th>
                                    <?php _e('Log of sent newsletters', 'newsletter') ?>
                                </th>
                                <td>
                                    <?php $controls->yesno('export_newsletters'); ?>
                                </td>
                            </tr>
                        </table>
                    <?php } ?>
                </div>

                <?php if (NEWSLETTER_DEBUG) { ?>
                    <div id="tabs-debug">
                        <pre><?php echo esc_html(json_encode($this->get_db_options('', $language), JSON_PRETTY_PRINT)) ?></pre>
                    </div>
                <?php } ?>
            </div>

            <p>
                <?php $controls->button_save() ?>
            </p>

        </form>




    </div>

    <?php include NEWSLETTER_DIR . '/tnp-footer.php'; ?>

</div>
