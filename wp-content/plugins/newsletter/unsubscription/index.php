<?php
/* @var $this NewsletterUnsubscriptionAdmin */
/* @var $controls NewsletterControls */
/* @var $logger NewsletterLogger */


defined('ABSPATH') || exit;

if (!$controls->is_action()) {
    $controls->data = $this->get_options('', $language);
} else {
    if ($controls->is_action('save')) {
        foreach ($controls->data as $k => $v) {
            if (strpos($k, '_custom') > 0) {
                if (empty($v)) {
                    $controls->data[str_replace('_custom', '', $k)] = '';
                }
                // Remove the _custom field
                unset($controls->data[$k]);
            }
        }
        
        $this->save_options($controls->data, '', $language);
        $controls->data = $this->get_options('', $language);
        $controls->add_message_saved();
    }
}

foreach (['unsubscribe_text', 'error_text', 'unsubscribed_text', 'unsubscribed_message', 'reactivated_text'] as $key) {
    if (!empty($controls->data[$key])) {
        $controls->data[$key . '_custom'] = '1';
    }
}

?>
<div class="wrap" id="tnp-wrap">

    <?php include NEWSLETTER_ADMIN_HEADER ?>

    <div id="tnp-heading">
        <?php $controls->title_help('/cancellation') ?>
        <!--<h2><?php _e('Unsubscribe', 'newsletter') ?></h2>-->
        <h2><?php _e('Subscribers', 'newsletter') ?></h2>
        <?php include __DIR__ . '/../users/nav.php' ?>
    </div>

    <div id="tnp-body">
        
        <?php $controls->show() ?>

        <form method="post" action="">
            <?php $controls->init(); ?>

            <div class="tnp-tabs">

                <ul>
                    <li><a href="#tabs-cancellation"><?php _e('Confirm', 'newsletter') ?></a></li>
                    <li><a href="#tabs-goodbye"><?php _e('Goodbye', 'newsletter') ?></a></li>
                    <li><a href="#tabs-reactivation"><?php _e('Reactivation', 'newsletter') ?></a></li>
                    <li><a href="#tabs-advanced"><?php _e('Advanced', 'newsletter') ?></a></li>
                    <?php if (NEWSLETTER_DEBUG) { ?>
                        <li><a href="#tabs-debug">Debug</a></li>
                    <?php } ?>
                </ul>

                <div id="tabs-cancellation">
                    <?php $this->language_notice(); ?>
                    <table class="form-table">
                        <tr>
                            <th><?php _e('Opt-out message', 'newsletter') ?></th>
                            <td>
                                <?php $controls->checkbox2('unsubscribe_text_custom', 'Customize', ['onchange' => 'tnp_refresh_binds()']); ?>
                                <div data-bind="options-unsubscribe_text_custom">
                                    <?php $controls->wp_editor('unsubscribe_text', ['editor_height' => 250], ['default' => $this->get_default_text('unsubscribe_text')]); ?>
                                </div>
                                <div data-bind="!options-unsubscribe_text_custom" class="tnpc-default-text">
                                    <?php echo wp_kses_post($this->get_default_text('unsubscribe_text')) ?>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th><?php _e('On error', 'newsletter') ?></th>
                            <td>
                                <?php $controls->checkbox2('error_text_custom', 'Customize', ['onchange' => 'tnp_refresh_binds()']); ?>
                                <div data-bind="options-error_text_custom">
                                    <?php $controls->wp_editor('error_text', ['editor_height' => 150], ['default' => $this->get_default_text('error_text')]); ?>
                                </div>
                                <div data-bind="!options-error_text_custom" class="tnpc-default-text">
                                    <?php echo wp_kses_post($this->get_default_text('error_text')) ?>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div id="tabs-goodbye">
                    
                    <?php $this->language_notice(); ?>
                    
                    <table class="form-table">


                        <tr>
                            <th><?php _e('Goodbye message', 'newsletter') ?></th>
                            <td>
                                <?php $controls->checkbox2('unsubscribed_text_custom', 'Customize', ['onchange' => 'tnp_refresh_binds()']); ?>
                                <div data-bind="options-unsubscribed_text_custom">
                                    <?php $controls->wp_editor('unsubscribed_text', ['editor_height' => 150], ['default' => $this->get_default_text('unsubscribed_text')]); ?>
                                </div>
                                <div data-bind="!options-unsubscribed_text_custom" class="tnpc-default-text">
                                    <?php echo wp_kses_post($this->get_default_text('unsubscribed_text')) ?>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th><?php _e('Goodbye email', 'newsletter') ?></th>
                            <td>
                                <?php if (!$language) { ?>
                                    <?php $controls->disabled('unsubscribed_disabled') ?>
                                <?php } ?>

                                <?php $controls->text('unsubscribed_subject', 70, $this->get_default_text('unsubscribed_subject')); ?>
                                <br><br>
                                <?php $controls->checkbox2('unsubscribed_message_custom', 'Customize', ['onchange' => 'tnp_refresh_binds()']); ?>
                                <div data-bind="options-unsubscribed_message_custom">
                                    <?php $controls->wp_editor('unsubscribed_message', ['editor_height' => 150], ['default' => $this->get_default_text('unsubscribed_message')]); ?>
                                </div>
                                <div data-bind="!options-unsubscribed_message_custom" class="tnpc-default-text">
                                    <?php echo wp_kses_post($this->get_default_text('unsubscribed_message')) ?>
                                </div>

                            </td>
                        </tr>
                    </table>
                </div>

                <div id="tabs-reactivation">
                    <?php $this->language_notice(); ?>
                    <table class="form-table">
                        <tr>
                            <th><?php _e('Reactivated message', 'newsletter') ?></th>
                            <td>
                                <?php $controls->checkbox2('reactivated_text_custom', 'Customize', ['onchange' => 'tnp_refresh_binds()']); ?>
                                <div data-bind="options-reactivated_text_custom">
                                    <?php $controls->wp_editor('reactivated_text', ['editor_height' => 150], ['default' => $this->get_default_text('reactivated_text')]); ?>
                                </div>
                                <div data-bind="!options-reactivated_text_custom" class="tnpc-default-text">
                                    <?php echo wp_kses_post($this->get_default_text('reactivated_text')) ?>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div id="tabs-advanced">
                    <?php $this->language_notice(); ?>
                    <?php if (!$language) { ?>
                        <table class="form-table">
                            <tr>
                                <th><?php _e('Notifications', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->yesno('notify'); ?>
                                    <?php $controls->text_email('notify_email'); ?>
                                </td>
                            </tr>
                        </table>
                        <h3>List-Unsubscribe header</h3>
                        <table class="form-table">
                            <tr>
                                <th>
                                    <?php _e('Disable unsubscribe headers', 'newsletter') ?>
                                    <?php $controls->field_help('/subscribers-and-management/cancellation/#list-unsubscribe') ?>
                                </th>
                                <td>
                                    <?php $controls->yesno('disable_unsubscribe_headers'); ?>

                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <?php _e('Cancellation requests via email', 'newsletter') ?>
                                    <?php $controls->field_help('/subscribers-and-management/cancellation/#list-unsubscribe') ?>
                                </th>
                                <td>
                                    <?php $controls->text_email('list_unsubscribe_mailto_header'); ?>
                                    <span class="description">
                                        <i class="fas fa-exclamation-triangle"></i> Please, read carefully the documentation page
                                    </span>
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
