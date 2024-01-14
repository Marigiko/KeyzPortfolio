<?php 
if ($media) {
    $td_width = '48%';
} else {
    $td_width = '100%';
}
?>
<style>
    .title {
        <?php $title_style->echo_css(0.8)?>
        margin: 0;
        line-height: normal;
        padding: 0 0 20px 0;
    }
    .text {
        <?php $text_style->echo_css()?>
        padding: 0 0 15px;
        line-height: 1.5;
        margin: 0;
    }

    .button {
        padding: 10px 0 0 0;
    }
</style>

<div dir="rtl">
    <?php if ($media) { ?>
        <table width="<?php echo $td_width ?>" align="right" class="responsive" border="0" cellspacing="0" cellpadding="0">

            <tr>
                <td align="center" valign="top">
                    <?php echo TNP_Composer::image($media); ?>
                </td>
            </tr>
        </table>
    <?php } ?>

    <table width="<?php echo $td_width ?>" align="left" class="responsive" border="0" cellspacing="0" cellpadding="0">
        <?php if (empty($order)) { ?> 
        <tr>
            <td inline-class="title" dir="ltr">
                <?php echo $options['title'] ?>
            </td>
        </tr>
        <tr>
            <td inline-class="text" dir="ltr">
                <?php echo $options['text'] ?>
            </td>
        </tr>
        <?php } else { ?>
        <tr>
            <td inline-class="text" dir="ltr">
                <?php echo $options['text'] ?>
            </td>
        </tr>
        <tr>
            <td inline-class="title" dir="ltr">
                <?php echo $options['title'] ?>
            </td>
        </tr>
        
        <?php } ?>
        <tr>
            <td align="center" inline-class="button" dir="ltr">
                <?php echo TNP_Composer::button($button_options, 'button', $composer) ?>
            </td>
        </tr>
    </table>

</div>
