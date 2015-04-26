class AvatarUploader < CarrierWave::Uploader::Base
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  def default_url(*args)
    ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  end

  if Rails.env.production? || Rails.env.development?
    storage :fog
  else
    storage :file
  end

  def extension_white_list
    %w(jpg jpeg png)
  end
end
