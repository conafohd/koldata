CREATE OR REPLACE FUNCTION public.notify_send_editor_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'vault'
AS $function$
DECLARE
  v_webhook_secret text;
  v_function_url text;
BEGIN
  SELECT decrypted_secret
    INTO v_webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'send_editor_email_webhook_secret'
  ORDER BY created_at DESC
  LIMIT 1;

  IF coalesce(v_webhook_secret, '') = '' THEN
    RAISE WARNING 'Missing vault secret: send_editor_email_webhook_secret';
    RETURN NEW;
  END IF;

  SELECT decrypted_secret
    INTO v_function_url
  FROM vault.decrypted_secrets
  WHERE name = 'send_editor_email_function_url'
  ORDER BY created_at DESC
  LIMIT 1;

  IF coalesce(v_function_url, '') = '' THEN
    RAISE WARNING 'Missing vault secret: send_editor_email_function_url';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_function_url,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(NEW)
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-supabase-functions', v_webhook_secret
    ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_send_editor_email failed: %', SQLERRM;
    RETURN NEW;
END;
$function$
;
