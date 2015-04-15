class User < ActiveRecord::Base
  has_many :user_radios
  has_many :radios, through: :user_radios

  validates :email,
  uniqueness: true,
    presence: true,
      format: { with: /\A[a-z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+\z/ }

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  mount_uploader :picture, AvatarUploader
end
