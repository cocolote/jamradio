class Radio < ActiveRecord::Base
  has_many :user_radios
  has_many :users, through: :user_radios

  validates :name,
  uniqueness: {scope: :category},
    presence: true

  validates :category,
    presence: true
end
